// =============================================================================
// Museum-Grade Sculpted 3D Natural-History Specimens
// Built with continuous organic lofting (createOrganicLoftGeometry),
// hand-tinted 512x512 watercolour + stipple textures, and sepia-ink contours!
// Zero clunky toy spheres, cones, or floating floor-plane HTML boxes.
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  type WatercolourPalette,
} from './naturalistCraft';

// =============================================================================
// 1. SCULPTED NATURAL-HISTORY SONGBIRD (Greenish Warbler / Darwin Finch / Phlox)
// =============================================================================

export interface SongbirdOptions {
  dorsalPalette: WatercolourPalette;
  bellyPalette?: WatercolourPalette;
  wingBars?: 1 | 2;
  beakDepth?: number; // 0.6 (slender warbler) .. 2.1 (crushing ground finch!)
  beakLength?: number;
  scale?: number;
  seed?: number;
}

export function createSculptedSongbird3D(opts: SongbirdOptions): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(opts.scale ?? 1.0);

  const dorsalMat = createNaturalistMaterial(opts.dorsalPalette, 'feather', {
    roughness: 0.86,
    bumpScale: 0.028,
    seed: opts.seed ?? 101,
    inkStrength: 0.52,
  });
  const bellyMat = createNaturalistMaterial(
    opts.bellyPalette ?? {
      base: '#ebe4cc',
      wash: '#d9cfa8',
      deep: '#9e926d',
      highlight: '#f7f3e4',
      ink: '#403524',
    },
    'feather',
    { roughness: 0.88, bumpScale: 0.02, seed: (opts.seed ?? 101) + 7, inkStrength: 0.42 }
  );
  const beakMat = createNaturalistMaterial(
    { base: '#6e5e4d', wash: '#524436', deep: '#2f251d', highlight: '#9c8a74', ink: '#1e1610' },
    'keratin',
    { roughness: 0.62, inkStrength: 0.55 }
  );
  const legMat = createNaturalistMaterial(
    { base: '#8c6f52', wash: '#6e5339', deep: '#453220', highlight: '#b09474' },
    'keratin',
    { roughness: 0.78, inkStrength: 0.45 }
  );

  // Continuous single-piece lofted avian body from crown -> nape -> chest -> rump!
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.72, 0.44),   // Forehead / crown
    new THREE.Vector3(0, 0.68, 0.25),   // Nape
    new THREE.Vector3(0, 0.52, 0.06),   // Mantle / upper back
    new THREE.Vector3(0, 0.40, -0.22),  // Lower back
    new THREE.Vector3(0, 0.31, -0.52),  // Rump / tail base
  ]);
  const bodyGeo = createOrganicLoftGeometry(
    spineCurve,
    (t) => {
      // Smooth realistic songbird profile: rounded head (t~0.1), slight neck pinch (t~0.24), full breast (t~0.52), tapered rump
      const head = 0.16 * Math.exp(-Math.pow((t - 0.11) / 0.14, 2));
      const torso = 0.245 * Math.sin(Math.pow(Math.max(0, (t - 0.08) / 0.92), 0.75) * Math.PI);
      return Math.max(0.03, Math.max(head, torso));
    },
    {
      tubularSegs: 40,
      radialSegs: 26,
      aspectAt: (t) => [0.92, t > 0.25 && t < 0.72 ? 1.08 : 0.96],
      noiseAmp: 0.015,
    }
  );
  const bodyMesh = new THREE.Mesh(bodyGeo, dorsalMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  g.add(bodyMesh);

  // Soft pale ventral breast contour nestled smoothly along the belly
  const breastCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.55, 0.30),
    new THREE.Vector3(0, 0.33, 0.12),
    new THREE.Vector3(0, 0.24, -0.18),
    new THREE.Vector3(0, 0.26, -0.44),
  ]);
  const breastGeo = createOrganicLoftGeometry(
    breastCurve,
    (t) => 0.195 * Math.sin(t * Math.PI),
    { tubularSegs: 24, radialSegs: 18, aspectAt: () => [0.92, 0.78] }
  );
  const breastMesh = new THREE.Mesh(breastGeo, bellyMat);
  breastMesh.castShadow = true;
  g.add(breastMesh);

  // Layered folded wings (curved organic shell panels with optional pale wing bars!)
  const wShape = new THREE.Shape();
  wShape.moveTo(0, 0);
  wShape.bezierCurveTo(0.18, 0.14, 0.48, 0.10, 0.74, -0.06);
  wShape.bezierCurveTo(0.56, -0.16, 0.24, -0.18, 0, -0.08);
  const wGeo = new THREE.ExtrudeGeometry(wShape, {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 3,
  });
  wGeo.rotateY(Math.PI / 2);

  const barMat = createNaturalistMaterial(
    { base: '#f4edd2', wash: '#dfd5b0', deep: '#a89c72', highlight: '#fffdf2' },
    'feather',
    { roughness: 0.85, inkStrength: 0.35 }
  );

  for (const s of [-1, 1]) {
    const wingGroup = new THREE.Group();
    const wing = new THREE.Mesh(wGeo, dorsalMat);
    wing.castShadow = true;
    wingGroup.add(wing);

    // Crisp diagnostic Greenish Warbler wing bars (1 bar west vs 2 bars east!)
    const bars = opts.wingBars ?? 1;
    for (let b = 0; b < bars; b++) {
      const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.15, 5, 8), barMat);
      bar.position.set(0.032 * s, 0.01 - b * 0.02, -0.22 - b * 0.11);
      bar.rotation.x = 0.22;
      wingGroup.add(bar);
    }

    wingGroup.position.set(s * 0.145, 0.47, 0.14);
    wingGroup.rotation.y = s * -0.14;
    wingGroup.rotation.z = s * -0.1;
    wingGroup.rotation.x = -0.26;
    if (s === -1) wingGroup.scale.x = -1;
    g.add(wingGroup);
  }

  // Fanned layered tail rectrices (5 distinct tapered feathers)
  for (let i = -2; i <= 2; i++) {
    const fCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(i * 0.022, 0.31, -0.46),
      new THREE.Vector3(i * 0.045, 0.26, -0.78),
      new THREE.Vector3(i * 0.068, 0.21, -1.06),
    ]);
    const fGeo = createOrganicLoftGeometry(fCurve, (t) => 0.045 * (1 - t * 0.35), {
      tubularSegs: 14,
      radialSegs: 8,
      aspectAt: () => [1.35, 0.24],
    });
    const feather = new THREE.Mesh(fGeo, dorsalMat);
    feather.castShadow = true;
    g.add(feather);
  }

  // Sculpted curved keratin beak anchored seamlessly inside the head contour!
  const bDepth = opts.beakDepth ?? 0.72;
  const bLen = opts.beakLength ?? 0.25;
  const upperCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.70, 0.37),
    new THREE.Vector3(0, 0.70 + 0.012 * bDepth, 0.38 + bLen * 0.55),
    new THREE.Vector3(0, 0.665, 0.39 + bLen),
  ]);
  const upperBeak = new THREE.Mesh(
    createOrganicLoftGeometry(
      upperCurve,
      (t) => (0.048 * bDepth) * Math.pow(1 - t, 0.72),
      { tubularSegs: 16, radialSegs: 12, aspectAt: () => [0.82, 1.05] }
    ),
    beakMat
  );
  upperBeak.castShadow = true;
  g.add(upperBeak);

  const lowerCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.665, 0.37),
    new THREE.Vector3(0, 0.655 - 0.008 * bDepth, 0.38 + bLen * 0.5),
    new THREE.Vector3(0, 0.662, 0.38 + bLen * 0.92),
  ]);
  const lowerBeak = new THREE.Mesh(
    createOrganicLoftGeometry(
      lowerCurve,
      (t) => (0.036 * bDepth) * Math.pow(1 - t, 0.78),
      { tubularSegs: 14, radialSegs: 10, aspectAt: () => [0.78, 0.85] }
    ),
    beakMat
  );
  g.add(lowerBeak);

  // Subtle Audubon dark bead eyes nestled naturally into the head sides
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x181310, roughness: 0.14 });
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xefe7ca, roughness: 0.88 });
  for (const s of [-1, 1]) {
    const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 6, 14), ringMat);
    eyeRing.position.set(s * 0.112, 0.725, 0.31);
    eyeRing.rotation.y = s * Math.PI / 2;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), eyeMat);
    eye.position.set(s * 0.114, 0.725, 0.31);
    g.add(eyeRing, eye);
  }

  // Slender jointed tarsus legs & perching toes resting cleanly on the rag paper
  for (const s of [-1, 1]) {
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.095, 0.28, -0.05),
      new THREE.Vector3(s * 0.105, 0.14, -0.10),
      new THREE.Vector3(s * 0.10, 0.02, -0.02),
    ]);
    const leg = new THREE.Mesh(
      createOrganicLoftGeometry(legCurve, () => 0.016, { tubularSegs: 12, radialSegs: 8 }),
      legMat
    );
    leg.castShadow = true;
    g.add(leg);

    // 3 forward toes + 1 hallux rear toe
    for (const [dx, dz] of [
      [-0.04, 0.11],
      [0.0, 0.14],
      [0.04, 0.11],
      [0.0, -0.09],
    ] as [number, number][]) {
      const toeCurve = new THREE.LineCurve3(
        new THREE.Vector3(s * 0.1, 0.018, -0.02),
        new THREE.Vector3(s * 0.1 + dx, 0.012, -0.02 + dz)
      );
      g.add(new THREE.Mesh(new THREE.TubeGeometry(toeCurve, 4, 0.009, 6, false), legMat));
    }
  }

  return g;
}

// =============================================================================
// 2. BOTANICAL FRUIT TWIG SPECIMEN (Apple Malus & Hawthorn Crataegus + Rhagoletis)
// =============================================================================

export function createBotanicalFruitTwig3D(opts: {
  fruit: 'apple' | 'hawthorn';
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(opts.scale ?? 1.0);

  const barkMat = createNaturalistMaterial(
    { base: '#6e523a', wash: '#523b28', deep: '#332216', highlight: '#947658' },
    'strata',
    { roughness: 0.9, inkStrength: 0.5 }
  );
  const leafMat = createNaturalistMaterial(
    { base: '#5f8a52', wash: '#416b38', deep: '#244220', highlight: '#9bc27c', ink: '#1e331a' },
    'botanical',
    { roughness: 0.82, side: THREE.DoubleSide, inkStrength: 0.45 }
  );

  // Curved natural woody twig
  const twigCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.05, 0.85, -0.2),
    new THREE.Vector3(-0.25, 0.92, 0.05),
    new THREE.Vector3(0.55, 0.78, -0.05),
    new THREE.Vector3(1.15, 0.55, 0.12),
  ]);
  const twig = new THREE.Mesh(
    createOrganicLoftGeometry(twigCurve, (t) => 0.055 * (1 - t * 0.48), {
      tubularSegs: 28,
      radialSegs: 12,
      noiseAmp: 0.04,
    }),
    barkMat
  );
  twig.castShadow = true;
  g.add(twig);

  // Sculpted serrated botanical leaves arching off the twig
  const lShape = new THREE.Shape();
  lShape.moveTo(0, 0);
  lShape.bezierCurveTo(0.24, 0.14, 0.30, 0.48, 0.12, 0.76);
  lShape.bezierCurveTo(0.04, 0.88, 0, 0.94, 0, 0.98);
  lShape.bezierCurveTo(0, 0.94, -0.04, 0.88, -0.12, 0.76);
  lShape.bezierCurveTo(-0.30, 0.48, -0.24, 0.14, 0, 0);
  const lGeo = new THREE.ExtrudeGeometry(lShape, { depth: 0.012, bevelEnabled: false });
  lGeo.rotateX(-Math.PI / 2);
  const pos = lGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const x = pos.getX(i);
    pos.setY(i, pos.getY(i) + Math.sin(-z * 2.6) * 0.09 - Math.abs(x) * 0.08);
  }
  lGeo.computeVertexNormals();

  for (const [px, py, pz, ry, rz] of [
    [-0.55, 0.90, -0.05, 0.9, 0.2],
    [0.15, 0.86, 0.02, -0.65, -0.22],
    [0.65, 0.74, 0.0, -2.1, 0.15],
  ] as [number, number, number, number, number][]) {
    const leaf = new THREE.Mesh(lGeo, leafMat);
    leaf.position.set(px, py, pz);
    leaf.rotation.set(0.2, ry, rz);
    leaf.scale.setScalar(0.75);
    leaf.castShadow = true;
    g.add(leaf);
  }

  if (opts.fruit === 'apple') {
    // True anatomical LatheGeometry Malus domestica apple with stem hollow & calyx!
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const a = t * Math.PI;
      // Classic apple cardioid-lathe profile with indented top stem basin and bottom calyx
      const r = Math.sin(a) * (0.48 + 0.06 * Math.cos(a * 2));
      const y = -Math.cos(a) * 0.44 + (t < 0.15 ? 0.07 * (1 - t / 0.15) : 0) - (t > 0.85 ? 0.09 * ((t - 0.85) / 0.15) : 0);
      pts.push(new THREE.Vector2(Math.max(0.002, r), y));
    }
    const appleGeo = new THREE.LatheGeometry(pts, 36);
    const appleMat = createNaturalistMaterial(
      { base: '#c9543e', wash: '#a63326', deep: '#6b1b15', highlight: '#ebbd71', ink: '#421610' },
      'fruit',
      { roughness: 0.72, bumpScale: 0.015, seed: 44, inkStrength: 0.46 }
    );
    const apple = new THREE.Mesh(appleGeo, appleMat);
    apple.position.set(0.0, 0.42, 0.12);
    apple.castShadow = true;
    g.add(apple);

    // Curved apple pedicel stem connecting to twig
    const pedCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.78, 0.12),
      new THREE.Vector3(-0.04, 0.86, 0.08),
      new THREE.Vector3(-0.08, 0.91, 0.04),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(pedCurve, 10, 0.018, 8, false), barkMat));
  } else {
    // Clustered scarlet Crataegus hawthorn berries hanging on delicate pedicels!
    const berryMat = createNaturalistMaterial(
      { base: '#b82c2c', wash: '#8c1a1c', deep: '#4f0c10', highlight: '#e36e54', ink: '#330b0c' },
      'fruit',
      { roughness: 0.68, seed: 88, inkStrength: 0.5 }
    );
    const coords: [number, number, number][] = [
      [-0.22, 0.44, 0.15],
      [0.04, 0.36, 0.24],
      [0.24, 0.46, 0.10],
      [-0.08, 0.52, -0.05],
      [0.14, 0.54, -0.06],
    ];
    coords.forEach(([bx, by, bz]) => {
      const berry = new THREE.Mesh(new THREE.SphereGeometry(0.145, 20, 16), berryMat);
      berry.scale.set(0.95, 1.12, 0.95);
      berry.position.set(bx, by, bz);
      berry.castShadow = true;
      g.add(berry);

      const ped = new THREE.CatmullRomCurve3([
        new THREE.Vector3(bx, by + 0.14, bz),
        new THREE.Vector3(bx * 0.6, 0.72, bz * 0.4),
        new THREE.Vector3(bx * 0.3, 0.88, 0.02),
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(ped, 8, 0.01, 6, false), barkMat));
    });
  }

  return g;
}

// =============================================================================
// 3. SCULPTED BOTANICAL TRAGOPOGON BLOSSOM (Instant Allopolyploid Speciation)
// =============================================================================

export function createTragopogonBlossom3D(opts: {
  species: 'dubius' | 'pratensis' | 'miscellus_4n';
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  const isGiant = opts.species === 'miscellus_4n';
  g.scale.setScalar((opts.scale ?? 1.0) * (isGiant ? 1.38 : 0.96));

  const stemMat = createNaturalistMaterial(
    { base: '#6a8e58', wash: '#4a6e3d', deep: '#294222', highlight: '#a4c48b', ink: '#1e3318' },
    'botanical',
    { roughness: 0.85, inkStrength: 0.48 }
  );
  const petalPalette: WatercolourPalette =
    opts.species === 'dubius'
      ? { base: '#f0df78', wash: '#d9c048', deep: '#9c831c', highlight: '#fcf5be', ink: '#635110' }
      : opts.species === 'pratensis'
        ? { base: '#eba734', wash: '#cc7f16', deep: '#8a4c08', highlight: '#fbd37a', ink: '#572f05' }
        : { base: '#f2c138', wash: '#d6921c', deep: '#8f550a', highlight: '#fce38a', ink: '#573308' };

  const petalMat = createNaturalistMaterial(petalPalette, 'botanical', {
    roughness: 0.78,
    side: THREE.DoubleSide,
    inkStrength: 0.44,
    seed: isGiant ? 303 : 101,
  });

  // Gracefully curving hollow botanical stalk with swollen receptacle cup
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.08, 0.0, 0.05),
    new THREE.Vector3(-0.04, 0.45, 0.02),
    new THREE.Vector3(0.02, 0.88, -0.02),
    new THREE.Vector3(0.0, 1.18, 0.0),
  ]);
  const stem = new THREE.Mesh(
    createOrganicLoftGeometry(
      stemCurve,
      (t) => 0.042 + (t > 0.82 ? Math.pow((t - 0.82) / 0.18, 1.5) * 0.14 : 0),
      { tubularSegs: 24, radialSegs: 14 }
    ),
    stemMat
  );
  stem.castShadow = true;
  g.add(stem);

  // Diagnostic Tragopogon star of long pointed green phyllaries (involucral bracts!)
  const nBracts = isGiant ? 10 : 8;
  const bractShape = new THREE.Shape();
  bractShape.moveTo(0, 0);
  bractShape.bezierCurveTo(0.06, 0.18, 0.04, 0.56, 0, 0.78);
  bractShape.bezierCurveTo(-0.04, 0.56, -0.06, 0.18, 0, 0);
  const bractGeo = new THREE.ExtrudeGeometry(bractShape, { depth: 0.008, bevelEnabled: false });
  bractGeo.rotateX(-Math.PI / 2);

  for (let i = 0; i < nBracts; i++) {
    const ang = (i / nBracts) * Math.PI * 2;
    const bract = new THREE.Mesh(bractGeo, stemMat);
    bract.position.set(0, 1.16, 0);
    bract.rotation.y = ang;
    bract.rotation.x = 0.24;
    bract.castShadow = true;
    g.add(bract);
  }

  // Two concentric rings of individually curved ligulate florets!
  const pShape = new THREE.Shape();
  pShape.moveTo(-0.025, 0);
  pShape.bezierCurveTo(-0.06, 0.22, -0.065, 0.45, -0.045, 0.58);
  pShape.lineTo(0.0, 0.62);
  pShape.lineTo(0.045, 0.58);
  pShape.bezierCurveTo(0.065, 0.45, 0.06, 0.22, 0.025, 0);
  pShape.closePath();
  const pGeo = new THREE.ExtrudeGeometry(pShape, { depth: 0.006, bevelEnabled: false });
  pGeo.rotateX(-Math.PI / 2);

  const outerCount = isGiant ? 20 : 14;
  for (let i = 0; i < outerCount; i++) {
    const ang = (i / outerCount) * Math.PI * 2;
    const petal = new THREE.Mesh(pGeo, petalMat);
    petal.position.set(0, 1.21, 0);
    petal.rotation.y = ang;
    petal.rotation.x = -0.18;
    petal.castShadow = true;
    g.add(petal);
  }
  const innerCount = isGiant ? 14 : 10;
  for (let i = 0; i < innerCount; i++) {
    const ang = (i / innerCount) * Math.PI * 2 + 0.15;
    const petal = new THREE.Mesh(pGeo, petalMat);
    petal.scale.setScalar(0.68);
    petal.position.set(0, 1.24, 0);
    petal.rotation.y = ang;
    petal.rotation.x = -0.52;
    g.add(petal);
  }

  // Finely stippled central pollen receptacle disk
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 12),
    createNaturalistMaterial(
      { base: '#9e681c', wash: '#784a0e', deep: '#4a2b06', highlight: '#d69d3e' },
      'strata',
      { roughness: 0.9, inkStrength: 0.55 }
    )
  );
  center.scale.set(1, 0.42, 1);
  center.position.set(0, 1.24, 0);
  g.add(center);

  return g;
}

// =============================================================================
// 4. INTERLOCKING 3D SCULPTED BIOPOLYMER PROTEINS (Dobzhansky-Muller Incompatibility)
// =============================================================================

export function createInterlockingProteins3D(clash: boolean, scale = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  const matA = createNaturalistMaterial(
    { base: '#549e96', wash: '#2f7870', deep: '#184a45', highlight: '#b8e3de', ink: '#143834' },
    'tissue',
    { roughness: 0.78, inkStrength: 0.52, seed: 201 }
  );
  const matB = createNaturalistMaterial(
    clash
      ? { base: '#d4665c', wash: '#ad3b32', deep: '#6b1c17', highlight: '#f2b8b2', ink: '#47120e' }
      : { base: '#dfa449', wash: '#ba7a20', deep: '#78480b', highlight: '#f7dca4', ink: '#4a2c08' },
    'tissue',
    { roughness: 0.78, inkStrength: 0.52, seed: 209 }
  );

  // Smooth C-shaped binding pocket protein A (planar arc -> zero Frenet twist!)
  const curveA = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.45, -0.72),
    new THREE.Vector3(-0.88, 0.45, -0.42),
    new THREE.Vector3(-1.05, 0.45, 0.0),
    new THREE.Vector3(-0.88, 0.45, 0.42),
    new THREE.Vector3(-0.35, 0.45, 0.72),
  ]);
  const protA = new THREE.Mesh(
    createOrganicLoftGeometry(curveA, (t) => 0.17 + 0.05 * Math.sin(t * Math.PI), {
      tubularSegs: 36,
      radialSegs: 20,
      noiseAmp: 0.035,
    }),
    matA
  );
  protA.castShadow = true;
  g.add(protA);

  // Partner protein B: docks cleanly into pocket when compatible, swells & pushes right when clashing!
  const sep = clash ? 0.42 : -0.18;
  const curveB = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.75 + sep, 0.45, -0.58),
    new THREE.Vector3(0.32 + sep, 0.45, -0.25),
    new THREE.Vector3(0.22 + sep, 0.45, 0.0),
    new THREE.Vector3(0.32 + sep, 0.45, 0.25),
    new THREE.Vector3(0.75 + sep, 0.45, 0.58),
  ]);
  const protB = new THREE.Mesh(
    createOrganicLoftGeometry(
      curveB,
      (t) => (clash ? 0.22 : 0.16) + 0.04 * Math.sin(t * Math.PI * 2),
      { tubularSegs: 36, radialSegs: 20, noiseAmp: 0.04 }
    ),
    matB
  );
  protB.castShadow = true;
  g.add(protB);

  return g;
}

// =============================================================================
// 5. LOGARITHMIC AMMONITE DEEP-TIME SPIRAL (3.8 Ga -> Present)
// =============================================================================

export function createAmmoniteSpiral3D(highlightFrac: number, scale = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  // Continuous logarithmic coiled ammonite shell (2.75 turns)
  const pts: THREE.Vector3[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = t * Math.PI * 5.4;
    const r = 0.065 * Math.exp(0.185 * theta);
    pts.push(new THREE.Vector3(Math.cos(theta) * r, 0.24 + t * 0.12, Math.sin(theta) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);

  const shellMat = createNaturalistMaterial(
    { base: '#c9a66b', wash: '#9e7740', deep: '#5c401c', highlight: '#f0dfc0', ink: '#3b2610' },
    'strata',
    { roughness: 0.78, bumpScale: 0.032, inkStrength: 0.54, seed: 501 }
  );
  const shellGeo = createOrganicLoftGeometry(
    curve,
    (t) => {
      // Gently ribbed logarithmic whorl expansion!
      const rib = 1 + 0.09 * Math.sin(t * 145);
      return (0.03 + Math.pow(t, 1.35) * 0.31) * rib;
    },
    { tubularSegs: 88, radialSegs: 20, aspectAt: () => [0.95, 1.15] }
  );
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  g.add(shell);

  // Milestone golden-carmine amber bead sliding along the spiral at highlightFrac!
  const pt = curve.getPointAt(Math.max(0.02, Math.min(0.99, highlightFrac)));
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 14),
    createNaturalistMaterial(
      { base: '#cf523e', wash: '#a32e1e', deep: '#63150c', highlight: '#f2a996' },
      'bone',
      { inkStrength: 0.45 }
    )
  );
  beacon.position.set(pt.x, pt.y + 0.24, pt.z);
  beacon.castShadow = true;
  g.add(beacon);

  return g;
}

// =============================================================================
// 6. VOLCANIC ZIRCON & FELDSPAR CRYSTAL CLUSTER (Radiometric Decay)
// =============================================================================

export function createMineralCrystalCluster3D(parentFraction: number, scale = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  // Hand-painted volcanic ash tuff matrix rock base
  const rockGeo = new THREE.DodecahedronGeometry(0.95, 2);
  const pos = rockGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = 1 + 0.12 * Math.sin(x * 3.1 + z * 2.7) + 0.08 * Math.cos(y * 4.2);
    pos.setXYZ(i, x * n * 1.25, Math.max(-0.1, y * 0.52 * n), z * n * 1.1);
  }
  rockGeo.computeVertexNormals();
  const rock = new THREE.Mesh(
    rockGeo,
    createNaturalistMaterial(
      { base: '#9e9280', wash: '#786d5c', deep: '#453e33', highlight: '#ccc2b0' },
      'strata',
      { roughness: 0.92, bumpScale: 0.035, inkStrength: 0.5 }
    )
  );
  rock.position.y = 0.24;
  rock.castShadow = true;
  rock.receiveShadow = true;
  g.add(rock);

  const parentMat = createNaturalistMaterial(
    { base: '#8a5ea8', wash: '#653b82', deep: '#3b1d52', highlight: '#cfaee3', ink: '#29123b' },
    'keratin',
    { roughness: 0.42, inkStrength: 0.45, seed: 601 }
  );
  const daughterMat = createNaturalistMaterial(
    { base: '#e0ad48', wash: '#bd8522', deep: '#7a510c', highlight: '#fae0a2', ink: '#4a3006' },
    'keratin',
    { roughness: 0.48, inkStrength: 0.45, seed: 609 }
  );

  // 16 Hexagonal zircon / feldspar crystal prisms sprouting out of the volcanic ash rock!
  const total = 16;
  const nParent = Math.round(parentFraction * total);
  for (let i = 0; i < total; i++) {
    const ang = i * 2.39996;
    const rad = 0.18 * Math.sqrt(i + 0.5);
    const h = 0.45 + (i % 4) * 0.16;
    const prism = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.088, h, 6),
      i < nParent ? parentMat : daughterMat
    );
    prism.position.set(Math.cos(ang) * rad, 0.46 + h * 0.35, Math.sin(ang) * rad);
    prism.rotation.set(Math.sin(ang) * 0.32, ang, -Math.cos(ang) * 0.32);
    prism.castShadow = true;
    g.add(prism);
  }

  return g;
}

// =============================================================================
// 7. DEVONIAN SANDSTONE FOSSIL SLAB & TIKTAALIK ROSEAE SKELETON (375 Ma)
// =============================================================================

export function createTiktaalikFossil3D(strataStage: 'older_385' | 'tiktaalik_375' | 'younger_365', scale = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  // Carved stratified Ellesmere Island Devonian red-sandstone slab
  const slabGeo = new THREE.BoxGeometry(3.4, 0.28, 1.95, 16, 4, 10);
  const pos = slabGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const edgeNoise = 0.06 * Math.sin(x * 2.8 + z * 3.1) + 0.04 * Math.cos(z * 5.2);
    pos.setXYZ(i, x + edgeNoise * 0.6, y + (y > 0 ? edgeNoise * 0.45 : 0), z + edgeNoise * 0.6);
  }
  slabGeo.computeVertexNormals();
  const slabPalette: WatercolourPalette =
    strataStage === 'older_385'
      ? { base: '#9e8c78', wash: '#786858', deep: '#4a3f34', highlight: '#c9bba8' }
      : strataStage === 'tiktaalik_375'
        ? { base: '#c28363', wash: '#9c5e40', deep: '#61341f', highlight: '#e3b89d' }
        : { base: '#b59d76', wash: '#8c7651', deep: '#54452b', highlight: '#dbd0b2' };
  const slab = new THREE.Mesh(
    slabGeo,
    createNaturalistMaterial(slabPalette, 'strata', { roughness: 0.92, bumpScale: 0.032, inkStrength: 0.5 })
  );
  slab.position.set(0, 0.14, 0);
  slab.castShadow = true;
  slab.receiveShadow = true;
  g.add(slab);

  // Ivory fossilized skeleton resting in high relief atop the Devonian matrix!
  const boneMat = createNaturalistMaterial(
    { base: '#ebdcb9', wash: '#cfb88c', deep: '#8a724a', highlight: '#fbf4e2', ink: '#47361e' },
    'bone',
    { roughness: 0.8, bumpScale: 0.025, inkStrength: 0.58, seed: 707 }
  );

  // Articulated vertebral column
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.35, 0.30, 0.05),
    new THREE.Vector3(-0.65, 0.31, -0.04),
    new THREE.Vector3(0.15, 0.32, 0.02),
    new THREE.Vector3(0.88, 0.32, 0.0),
  ]);
  const spineMesh = new THREE.Mesh(
    createOrganicLoftGeometry(spine, (t) => 0.045 + 0.035 * Math.sin(t * Math.PI), {
      tubularSegs: 28,
      radialSegs: 12,
    }),
    boneMat
  );
  spineMesh.castShadow = true;
  g.add(spineMesh);

  // Flattened crocodile-like skull (shorter/rounder in fish, flat & broad with dorsal eyes in Tiktaalik, wider in Acanthostega!)
  const skullLen = strataStage === 'older_385' ? 0.45 : strataStage === 'tiktaalik_375' ? 0.62 : 0.56;
  const skullCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.82, 0.33, 0),
    new THREE.Vector3(0.82 + skullLen * 0.55, 0.33, 0),
    new THREE.Vector3(0.82 + skullLen, 0.31, 0),
  ]);
  const skull = new THREE.Mesh(
    createOrganicLoftGeometry(
      skullCurve,
      (t) => 0.21 * Math.pow(1 - t * 0.65, 0.8),
      { tubularSegs: 20, radialSegs: 16, aspectAt: () => [0.42, 1.15] }
    ),
    boneMat
  );
  skull.castShadow = true;
  g.add(skull);

  // Ribcage pairs along torso
  for (let i = 0; i < 8; i++) {
    const rx = -0.55 + i * 0.16;
    for (const s of [-1, 1]) {
      const rib = new THREE.CatmullRomCurve3([
        new THREE.Vector3(rx, 0.32, 0),
        new THREE.Vector3(rx - 0.06, 0.31, s * 0.22),
        new THREE.Vector3(rx - 0.14, 0.29, s * 0.34),
      ]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(rib, 8, 0.016, 6, false), boneMat));
    }
  }

  // Diagnostic Pectoral Fin / Proto-Wrist / Polydactyl Foot!
  const finHighlight = createNaturalistMaterial(
    { base: '#61b8ac', wash: '#2f8a7d', deep: '#1a574f', highlight: '#d2efe9', ink: '#16423b' },
    'bone',
    { roughness: 0.78, inkStrength: 0.55 }
  );
  for (const s of [-1, 1]) {
    const hum = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.55, 0.31, s * 0.12),
      new THREE.Vector3(0.42, 0.30, s * 0.42),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(hum, 8, 0.044, 10, false), finHighlight));

    const radUlna = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, 0.30, s * 0.42),
      new THREE.Vector3(0.32, 0.29, s * 0.64),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(radUlna, 8, 0.036, 10, false), finHighlight));

    // Distal rays (fish) -> robust wrist radials (Tiktaalik!) -> 7/8 digits (Acanthostega!)
    const nDigits = strataStage === 'older_385' ? 4 : strataStage === 'tiktaalik_375' ? 5 : 7;
    const digitLen = strataStage === 'older_385' ? 0.16 : strataStage === 'tiktaalik_375' ? 0.21 : 0.28;
    for (let d = 0; d < nDigits; d++) {
      const spread = (d / (nDigits - 1) - 0.5) * 0.34;
      const dig = new THREE.LineCurve3(
        new THREE.Vector3(0.32, 0.29, s * 0.64),
        new THREE.Vector3(0.32 + spread, 0.29, s * (0.64 + digitLen))
      );
      g.add(new THREE.Mesh(new THREE.TubeGeometry(dig, 4, 0.015, 6, false), finHighlight));
    }
  }

  return g;
}

// =============================================================================
// 8. MORPHING CETACEAN SKELETON (Pakicetus 50 Ma -> Ambulocetus -> Dorudon -> Whale)
// =============================================================================

export function createWhaleTransitionSkeleton3D(stage: number, scale = 1.0): THREE.Group {
  // stage: 0.0 = Pakicetus (land), 0.33 = Ambulocetus, 0.66 = Dorudon (vestigial legs!), 1.0 = Modern Whale
  const g = new THREE.Group();
  g.scale.setScalar(scale);
  const t = Math.max(0, Math.min(1, stage));

  const boneMat = createNaturalistMaterial(
    { base: '#ecdcb8', wash: '#cfb584', deep: '#876b3f', highlight: '#fcf5e3', ink: '#423118' },
    'bone',
    { roughness: 0.78, bumpScale: 0.025, inkStrength: 0.56, seed: 808 }
  );
  const vestigialMat = createNaturalistMaterial(
    { base: '#df7d87', wash: '#bf4b59', deep: '#802431', highlight: '#f7d2d6', ink: '#4d141d' },
    'bone',
    { roughness: 0.76, inkStrength: 0.55 }
  );
  const blowholeMat = createNaturalistMaterial(
    { base: '#5eb4a8', wash: '#2d8579', deep: '#17524a', highlight: '#c9ede8', ink: '#123d37' },
    'bone',
    { roughness: 0.76, inkStrength: 0.55 }
  );

  // Undulating vertebral column elongating & streamlining as t -> 1
  const bodyLen = 1.45 + t * 0.75;
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-bodyLen, 0.55 + t * 0.15, 0),
    new THREE.Vector3(-bodyLen * 0.45, 0.68 + t * 0.08, 0),
    new THREE.Vector3(0.05, 0.74, 0),
    new THREE.Vector3(bodyLen * 0.52, 0.70 - t * 0.04, 0),
    new THREE.Vector3(bodyLen * 0.85, 0.66 - t * 0.06, 0),
  ]);
  const spine = new THREE.Mesh(
    createOrganicLoftGeometry(spineCurve, (u) => 0.045 + 0.055 * Math.sin(u * Math.PI), {
      tubularSegs: 40,
      radialSegs: 14,
    }),
    boneMat
  );
  spine.castShadow = true;
  g.add(spine);

  // Cranium + Elongating Rostrum
  const skullCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(bodyLen * 0.80, 0.66 - t * 0.05, 0),
    new THREE.Vector3(bodyLen * 0.80 + 0.35 + t * 0.25, 0.65 - t * 0.06, 0),
    new THREE.Vector3(bodyLen * 0.80 + 0.65 + t * 0.58, 0.58 - t * 0.06, 0),
  ]);
  const skull = new THREE.Mesh(
    createOrganicLoftGeometry(skullCurve, (u) => (0.16 + t * 0.05) * Math.pow(1 - u * 0.72, 0.7), {
      tubularSegs: 22,
      radialSegs: 16,
      aspectAt: () => [0.78, 1.05],
    }),
    boneMat
  );
  skull.castShadow = true;
  g.add(skull);

  // Migrating Nostril -> Blowhole! Slides backward from snout tip (t=0) to top of cranium (t=1)!
  const nostrilU = Math.max(0.18, 0.88 - t * 0.7);
  const nPt = skullCurve.getPointAt(nostrilU);
  const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), blowholeMat);
  nostril.scale.set(1.2, 0.65, 1.0);
  nostril.position.set(nPt.x, nPt.y + 0.11, 0);
  g.add(nostril);

  // Ribcage (10 curved pairs)
  for (let i = 0; i < 10; i++) {
    const f = 0.38 + (i / 10) * 0.42;
    const pt = spineCurve.getPointAt(f);
    const ribSpan = 0.26 + 0.12 * Math.sin((i / 10) * Math.PI);
    for (const s of [-1, 1]) {
      const ribCurve = new THREE.CatmullRomCurve3([
        pt,
        new THREE.Vector3(pt.x - 0.05, pt.y - 0.16, s * ribSpan),
        new THREE.Vector3(pt.x - 0.10, pt.y - 0.38, s * ribSpan * 0.45),
      ]);
      const rib = new THREE.Mesh(new THREE.TubeGeometry(ribCurve, 10, 0.017, 6, false), boneMat);
      rib.castShadow = true;
      g.add(rib);
    }
  }

  // Forelimb: Walking leg (t=0) -> Swept Cetacean Flipper (t=1)
  const shoulder = spineCurve.getPointAt(0.76);
  for (const s of [-1, 1]) {
    const fCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(shoulder.x, shoulder.y - 0.12, s * 0.18),
      new THREE.Vector3(shoulder.x - t * 0.16, shoulder.y - 0.36 + t * 0.08, s * (0.20 + t * 0.18)),
      new THREE.Vector3(shoulder.x - t * 0.42, 0.08 + t * 0.26, s * (0.18 + t * 0.42)),
    ]);
    const fore = new THREE.Mesh(
      createOrganicLoftGeometry(fCurve, (u) => (0.048 + t * 0.032) * (1 - u * 0.35), {
        tubularSegs: 16,
        radialSegs: 10,
        aspectAt: () => [1.0 + t * 0.9, 1.0 - t * 0.45],
      }),
      boneMat
    );
    fore.castShadow = true;
    g.add(fore);
  }

  // Hindlimb + Pelvis (carmine-rose highlight!): Weight-bearing leg (t=0) -> Tiny floating vestigial pelvic spur (t=1)!
  const hip = spineCurve.getPointAt(0.32);
  const legLen = Math.max(0.14, 0.62 * (1 - t * 0.86));
  for (const s of [-1, 1]) {
    const hCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(hip.x, hip.y - 0.12 - t * 0.14, s * 0.15),
      new THREE.Vector3(hip.x - 0.08, hip.y - 0.12 - t * 0.14 - legLen * 0.55, s * (0.16 + (1 - t) * 0.06)),
      new THREE.Vector3(hip.x - 0.04 - t * 0.12, hip.y - 0.12 - t * 0.14 - legLen, s * 0.15),
    ]);
    const hind = new THREE.Mesh(
      createOrganicLoftGeometry(hCurve, () => 0.044 * (1 - t * 0.52), { tubularSegs: 14, radialSegs: 10 }),
      vestigialMat
    );
    hind.castShadow = true;
    g.add(hind);
  }

  // Horizontal Tail Flukes emerging in pelagic whales (t > 0.45)!
  if (t > 0.4) {
    const flkScale = (t - 0.4) / 0.6;
    const flkShape = new THREE.Shape();
    flkShape.moveTo(0, 0);
    flkShape.bezierCurveTo(-0.18 * flkScale, 0.25 * flkScale, -0.45 * flkScale, 0.48 * flkScale, -0.58 * flkScale, 0.52 * flkScale);
    flkShape.bezierCurveTo(-0.32 * flkScale, 0.16 * flkScale, -0.25 * flkScale, 0.04 * flkScale, -0.18 * flkScale, 0);
    flkShape.bezierCurveTo(-0.25 * flkScale, -0.04 * flkScale, -0.32 * flkScale, -0.16 * flkScale, -0.58 * flkScale, -0.52 * flkScale);
    flkShape.bezierCurveTo(-0.45 * flkScale, -0.48 * flkScale, -0.18 * flkScale, -0.25 * flkScale, 0, 0);
    const flkGeo = new THREE.ExtrudeGeometry(flkShape, { depth: 0.025, bevelEnabled: false });
    flkGeo.rotateX(-Math.PI / 2);
    const fluke = new THREE.Mesh(
      flkGeo,
      createNaturalistMaterial(
        { base: '#7f99a6', wash: '#56707d', deep: '#2f434d', highlight: '#b8ced9' },
        'tissue',
        { roughness: 0.8, transparent: true, opacity: 0.85, inkStrength: 0.45 }
      )
    );
    fluke.position.set(-bodyLen + 0.05, 0.55 + t * 0.15, 0);
    fluke.castShadow = true;
    g.add(fluke);
  }

  return g;
}

