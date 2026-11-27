import * as THREE from 'three';
import type {
  AnalogySpecimenId,
  BoneRegionId,
  TetrapodSpeciesId,
} from './anatomyData';

interface SegmentSpec {
  p0: [number, number, number];
  p1: [number, number, number];
  r0: number;
  rMid: number;
  r1: number;
  flatY: number;
  bowZ: number;
  scale: number;
}

interface CarpalSpec {
  pos: [number, number, number];
  scale: [number, number, number];
}

interface SpeciesPose {
  humerus: SegmentSpec;
  radius: SegmentSpec;
  ulna: SegmentSpec;
  olecranon: SegmentSpec;
  carpals: CarpalSpec[];
  /** 5 digits (I..V), each up to 6 segments: [MC, P1, P2, P3, P4, P5] */
  digits: SegmentSpec[][];
  hoofScale: number;
  hoofPos: [number, number, number];
  hoofDir: [number, number, number];
  tissueType: TetrapodSpeciesId;
}

const REGION_PALETTES: Record<
  BoneRegionId,
  { base: string; wash: string; deep: string; ivory: string }
> = {
  stylopod: {
    base: '#e2ac4d',
    wash: '#c8831d',
    deep: '#8e560d',
    ivory: '#f6e4ba',
  },
  zeugopod: {
    base: '#61b8ac',
    wash: '#2f8a7d',
    deep: '#1a574f',
    ivory: '#d2efe9',
  },
  autopod: {
    base: '#e17e8a',
    wash: '#c24a5a',
    deep: '#862735',
    ivory: '#f8d4d8',
  },
};

const HOX_PALETTES: Record<
  BoneRegionId,
  { base: string; wash: string; deep: string; ivory: string }
> = {
  stylopod: {
    base: '#e89d2c',
    wash: '#c97410',
    deep: '#7e4305',
    ivory: '#fde7b6',
  },
  zeugopod: {
    base: '#2ca89a',
    wash: '#19786e',
    deep: '#0e4943',
    ivory: '#c4f5ee',
  },
  autopod: {
    base: '#db4b67',
    wash: '#ab2641',
    deep: '#6b1024',
    ivory: '#fcc5d0',
  },
};

/** Generate hand-tinted bone watercolour albedo + subtle organic bone bump textures */
function createWatercolourBoneTextures(palette: {
  base: string;
  wash: string;
  deep: string;
  ivory: string;
}): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0.0, palette.deep);
  grad.addColorStop(0.13, palette.wash);
  grad.addColorStop(0.30, palette.base);
  grad.addColorStop(0.50, palette.ivory);
  grad.addColorStop(0.72, palette.base);
  grad.addColorStop(0.89, palette.wash);
  grad.addColorStop(1.0, palette.deep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  let s = 1337;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i < 190; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rx = 8 + rand() * 24;
    const ry = 10 + rand() * 32;
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = i % 3 === 0 ? palette.ivory : i % 2 === 0 ? palette.wash : palette.deep;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Fine longitudinal bone striations
  ctx.save();
  ctx.globalAlpha = 0.075;
  ctx.strokeStyle = palette.deep;
  for (let i = 0; i < 90; i++) {
    const x = rand() * size;
    ctx.lineWidth = 0.6 + rand() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (rand() - 0.5) * 5,
      size * 0.33,
      x + (rand() - 0.5) * 5,
      size * 0.66,
      x,
      size
    );
    ctx.stroke();
  }
  ctx.restore();

  // Delicate ink-wash stippling near epiphyses
  ctx.save();
  ctx.fillStyle = '#3b2819';
  for (let i = 0; i < 130; i++) {
    const x = rand() * size;
    const nearEnd = rand() < 0.5 ? rand() * 40 : size - rand() * 40;
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.arc(x, nearEnd, 0.7 + rand() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;

  const bc = document.createElement('canvas');
  bc.width = size;
  bc.height = size;
  const bctx = bc.getContext('2d')!;
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 100; i++) {
    const x = rand() * size;
    bctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
    bctx.lineWidth = 1 + rand() * 1.6;
    bctx.beginPath();
    bctx.moveTo(x, 0);
    bctx.lineTo(x + (rand() - 0.5) * 4, size);
    bctx.stroke();
  }
  for (let i = 0; i < 200; i++) {
    const x = rand() * size;
    const y = rand() < 0.5 ? rand() * 48 : size - rand() * 48;
    bctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.15)';
    bctx.beginPath();
    bctx.arc(x, y, 0.9 + rand() * 2.0, 0, Math.PI * 2);
    bctx.fill();
  }

  const bumpMap = new THREE.CanvasTexture(bc);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;

  return { map, bumpMap };
}

/**
 * Create silky-smooth, anatomically rounded bone geometry (aligned along +Y from 0 to 1)
 * with hemispherical articular epiphyses, gentle bicondylar flare, and organic diaphysis.
 */
function createSculptedBoneGeometry(
  kind: 'long' | 'phalanx' | 'tip' | 'carpal' | 'hoof'
): THREE.BufferGeometry {
  if (kind === 'carpal') {
    const geo = new THREE.SphereGeometry(1, 20, 16);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const n = 1 + 0.08 * Math.sin(x * 2.7 + y * 2.1) + 0.06 * Math.cos(z * 3.1);
      pos.setXYZ(i, x * n * 1.04, y * n * 0.68, z * n * 0.92);
    }
    geo.computeVertexNormals();
    return geo;
  }

  if (kind === 'hoof') {
    // Rounded crescentic equine ungual phalanx (coffin bone)
    const rings = 18;
    const radSegs = 24;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (let iy = 0; iy <= rings; iy++) {
      const t = iy / rings;
      const cap =
        t < 0.1
          ? Math.sqrt(Math.max(0, 1 - Math.pow((0.1 - t) / 0.1, 2)))
          : t > 0.88
            ? Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.88) / 0.12, 2)))
            : 1;
      const r = (0.58 + 0.48 * Math.pow(t, 0.7)) * cap;
      for (let ir = 0; ir <= radSegs; ir++) {
        const u = ir / radSegs;
        const a = u * Math.PI * 2;
        const x = Math.cos(a) * r * 1.05;
        const z = Math.sin(a) * r * 0.56;
        positions.push(x, t, z);
        uvs.push(u, t);
      }
    }
    const stride = radSegs + 1;
    for (let iy = 0; iy < rings; iy++) {
      for (let ir = 0; ir < radSegs; ir++) {
        const a = iy * stride + ir;
        indices.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  const rings = kind === 'long' ? 32 : 22;
  const radSegs = kind === 'long' ? 26 : 20;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= rings; iy++) {
    const t = iy / rings; // 0 = proximal end, 1 = distal end

    // Smooth elliptical end-cap envelope (completely eliminates sharp flat caps)
    const proxCap = t < 0.08 ? Math.sqrt(Math.max(0.0001, 1 - Math.pow((0.08 - t) / 0.08, 2))) : 1;
    const distCap = t > 0.92 ? Math.sqrt(Math.max(0.0001, 1 - Math.pow((t - 0.92) / 0.08, 2))) : 1;

    // Gentle anatomical silhouette: bulbous rounded epiphyses tapering smoothly to slender waist
    const proxCondyle = 0.58 * Math.exp(-Math.pow((t - 0.085) / 0.11, 2));
    const distCondyle =
      kind === 'tip'
        ? 0.08 * Math.exp(-Math.pow((t - 0.88) / 0.12, 2))
        : 0.50 * Math.exp(-Math.pow((t - 0.915) / 0.11, 2));
    const taper = kind === 'tip' ? 1 - 0.38 * t : 1;
    const shaft = (0.66 + 0.06 * Math.sin(t * Math.PI)) * taper;
    const profile = (shaft + proxCondyle + distCondyle) * proxCap * distCap;

    // Subtle anatomical shaft curve
    const bendX = kind === 'long' ? Math.sin(t * Math.PI) * 0.032 : 0;

    for (let ir = 0; ir <= radSegs; ir++) {
      const u = ir / radSegs;
      const angle = u * Math.PI * 2;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);

      // Gentle bicondylar broadening at joint ends (smooth, never spiky)
      const endW =
        Math.exp(-Math.pow((t - 0.085) / 0.09, 2)) +
        (kind === 'tip' ? 0 : Math.exp(-Math.pow((t - 0.915) / 0.09, 2)));
      const condyleWidth = 1 + endW * 0.16 * Math.cos(2 * angle);

      const x = ca * profile * condyleWidth + bendX;
      const z = sa * profile * (1 - endW * 0.08) * 0.88;
      positions.push(x, t, z);
      uvs.push(u, t);
    }
  }

  const stride = radSegs + 1;
  for (let iy = 0; iy < rings; iy++) {
    for (let ir = 0; ir < radSegs; ir++) {
      const a = iy * stride + ir;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Chain articulated digit segments cleanly along a natural subtle curve */
function makeDigitChain(
  origin: [number, number, number],
  angleRad: number,
  lengths: number[],
  radii: number[],
  curvePerJoint: number,
  flatY = 0.8,
  activeCount = lengths.length
): SegmentSpec[] {
  const segs: SegmentSpec[] = [];
  let cx = origin[0];
  let cy = origin[1];
  let cz = origin[2];
  let a = angleRad;
  const maxSegs = 6;

  for (let i = 0; i < maxSegs; i++) {
    const active = i < activeCount && (lengths[i] ?? 0) > 0.01;
    const len = active ? lengths[i] : 0.03;
    const r = radii[Math.min(i, radii.length - 1)] ?? 0.035;
    const gap = active && i > 0 ? 0.022 : 0;

    const dx = Math.cos(a);
    const dz = Math.sin(a);
    const p0: [number, number, number] = [cx + dx * gap, cy, cz + dz * gap];
    const p1: [number, number, number] = [p0[0] + dx * len, cy, p0[2] + dz * len];

    segs.push({
      p0,
      p1,
      r0: r * 1.06,
      rMid: r * 0.72,
      r1: r * 0.96,
      flatY,
      bowZ: 0,
      scale: active ? 1 : 0,
    });

    if (active) {
      cx = p1[0];
      cy = p1[1];
      cz = p1[2];
      a += curvePerJoint;
    }
  }
  return segs;
}

/** Build the four anatomically balanced tetrapod forelimb poses, centered cleanly at (0, 0, 0) */
function buildSpeciesPoses(): Record<TetrapodSpeciesId, SpeciesPose> {
  // 1. HUMAN ARM (Homo sapiens) — diagonal classic museum-plate composition
  const humanCarpals: CarpalSpec[] = [
    { pos: [0.94, 0.02, -0.34], scale: [0.066, 0.055, 0.060] },
    { pos: [1.01, 0.02, -0.44], scale: [0.064, 0.055, 0.058] },
    { pos: [1.08, 0.01, -0.53], scale: [0.060, 0.050, 0.056] },
    { pos: [1.14, 0.00, -0.61], scale: [0.052, 0.048, 0.050] },
    { pos: [1.07, 0.02, -0.30], scale: [0.065, 0.055, 0.060] },
    { pos: [1.14, 0.02, -0.41], scale: [0.068, 0.056, 0.064] },
    { pos: [1.21, 0.01, -0.52], scale: [0.064, 0.054, 0.060] },
  ];

  const human: SpeciesPose = {
    humerus: {
      p0: [-2.48, 0.05, 1.04],
      p1: [-0.88, 0.02, 0.22],
      r0: 0.135,
      rMid: 0.078,
      r1: 0.130,
      flatY: 0.88,
      bowZ: 0.02,
      scale: 1,
    },
    // Clearly separated Radius (lateral/upper) & Ulna (medial/lower) with visible daylight gap!
    radius: {
      p0: [-0.82, 0.04, 0.11],
      p1: [0.85, 0.03, -0.37],
      r0: 0.062,
      rMid: 0.048,
      r1: 0.082,
      flatY: 0.86,
      bowZ: -0.05,
      scale: 1,
    },
    ulna: {
      p0: [-0.80, 0.00, 0.28],
      p1: [0.97, -0.01, -0.56],
      r0: 0.082,
      rMid: 0.046,
      r1: 0.054,
      flatY: 0.86,
      bowZ: 0.05,
      scale: 1,
    },
    olecranon: {
      p0: [-0.78, 0.00, 0.27],
      p1: [-1.02, 0.00, 0.37],
      r0: 0.072,
      rMid: 0.064,
      r1: 0.064,
      flatY: 0.82,
      bowZ: 0,
      scale: 1,
    },
    carpals: humanCarpals,
    digits: [
      // Digit I (Thumb)
      makeDigitChain([1.10, 0.02, -0.24], -1.04, [0.36, 0.24, 0.18], [0.050, 0.042, 0.034], 0.08, 0.84, 3),
      // Digit II (Index)
      makeDigitChain([1.22, 0.02, -0.34], -0.62, [0.50, 0.31, 0.20, 0.15], [0.046, 0.038, 0.031, 0.025], 0.03, 0.84, 4),
      // Digit III (Middle)
      makeDigitChain([1.28, 0.02, -0.45], -0.47, [0.54, 0.35, 0.23, 0.16], [0.048, 0.040, 0.032, 0.026], 0.02, 0.84, 4),
      // Digit IV (Ring)
      makeDigitChain([1.32, 0.01, -0.55], -0.32, [0.48, 0.32, 0.20, 0.15], [0.043, 0.036, 0.030, 0.024], 0.02, 0.84, 4),
      // Digit V (Pinky)
      makeDigitChain([1.33, 0.00, -0.65], -0.16, [0.40, 0.25, 0.16, 0.13], [0.039, 0.032, 0.027, 0.022], 0.03, 0.84, 4),
    ],
    hoofScale: 0,
    hoofPos: [2.1, 0, 0],
    hoofDir: [1, 0, 0],
    tissueType: 'human',
  };

  // 2. BAT WING (Pteropus vampyrus) — gracefully centered across x ∈ [-2.5, +2.6]
  const batCarpals: CarpalSpec[] = [
    { pos: [-0.42, 0.03, -0.64], scale: [0.055, 0.045, 0.050] },
    { pos: [-0.35, 0.03, -0.70], scale: [0.052, 0.045, 0.050] },
    { pos: [-0.28, 0.02, -0.73], scale: [0.050, 0.042, 0.048] },
    { pos: [-0.22, 0.01, -0.70], scale: [0.046, 0.040, 0.044] },
    { pos: [-0.35, 0.02, -0.60], scale: [0.052, 0.044, 0.048] },
    { pos: [-0.28, 0.02, -0.63], scale: [0.056, 0.046, 0.052] },
    { pos: [-0.21, 0.01, -0.62], scale: [0.050, 0.042, 0.046] },
  ];

  const bat: SpeciesPose = {
    humerus: {
      p0: [-2.52, 0.05, 0.42],
      p1: [-1.48, 0.03, 0.20],
      r0: 0.105,
      rMid: 0.060,
      r1: 0.092,
      flatY: 0.88,
      bowZ: 0.03,
      scale: 1,
    },
    radius: {
      p0: [-1.44, 0.04, 0.17],
      p1: [-0.38, 0.03, -0.68],
      r0: 0.064,
      rMid: 0.046,
      r1: 0.070,
      flatY: 0.88,
      bowZ: -0.06,
      scale: 1,
    },
    ulna: {
      p0: [-1.42, 0.00, 0.24],
      p1: [-0.94, -0.01, -0.10],
      r0: 0.044,
      rMid: 0.022,
      r1: 0.015,
      flatY: 0.86,
      bowZ: 0.03,
      scale: 0.9,
    },
    olecranon: {
      p0: [-1.42, 0.00, 0.24],
      p1: [-1.57, 0.00, 0.31],
      r0: 0.044,
      rMid: 0.036,
      r1: 0.032,
      flatY: 0.85,
      bowZ: 0,
      scale: 0.78,
    },
    carpals: batCarpals,
    digits: [
      // Digit I: clawed climbing thumb projecting upward
      makeDigitChain([-0.37, 0.04, -0.74], -1.84, [0.19, 0.20, 0.14], [0.036, 0.029, 0.020], 0.25, 0.85, 3),
      // Digit II: leading-edge spar
      makeDigitChain([-0.24, 0.03, -0.70], -0.22, [1.28, 0.36, 0.20], [0.032, 0.025, 0.018], 0.07, 0.85, 3),
      // Digit III: longest wingtip spar
      makeDigitChain([-0.20, 0.03, -0.64], -0.07, [1.44, 0.78, 0.58, 0.26], [0.035, 0.027, 0.020, 0.014], 0.08, 0.85, 4),
      // Digit IV: mid-wing spar
      makeDigitChain([-0.22, 0.02, -0.59], 0.29, [1.24, 0.62, 0.44], [0.032, 0.024, 0.017], 0.08, 0.85, 3),
      // Digit V: trailing-edge spar sweeping down
      makeDigitChain([-0.28, 0.01, -0.56], 0.78, [1.08, 0.48, 0.36], [0.030, 0.023, 0.016], 0.07, 0.85, 3),
    ],
    hoofScale: 0,
    hoofPos: [2.1, 0, 0],
    hoofDir: [1, 0, 0],
    tissueType: 'bat',
  };

  // 3. WHALE / DOLPHIN FLIPPER (Tursiops truncatus) — centered cleanly x ∈ [-2.3, +2.2]
  const whaleCarpals: CarpalSpec[] = [
    { pos: [-0.46, 0.02, -0.22], scale: [0.13, 0.06, 0.115] },
    { pos: [-0.42, 0.02, 0.02], scale: [0.135, 0.06, 0.12] },
    { pos: [-0.42, 0.01, 0.26], scale: [0.125, 0.06, 0.11] },
    { pos: [-0.46, 0.00, 0.45], scale: [0.10, 0.055, 0.095] },
    { pos: [-0.19, 0.02, -0.13], scale: [0.125, 0.06, 0.115] },
    { pos: [-0.17, 0.02, 0.12], scale: [0.13, 0.06, 0.115] },
    { pos: [-0.20, 0.01, 0.36], scale: [0.11, 0.055, 0.10] },
  ];

  const whale: SpeciesPose = {
    humerus: {
      p0: [-2.28, 0.04, 0.14],
      p1: [-1.34, 0.02, 0.09],
      r0: 0.24,
      rMid: 0.185,
      r1: 0.23,
      flatY: 0.46,
      bowZ: 0.02,
      scale: 1,
    },
    radius: {
      p0: [-1.25, 0.03, -0.07],
      p1: [-0.58, 0.02, -0.14],
      r0: 0.165,
      rMid: 0.155,
      r1: 0.178,
      flatY: 0.36,
      bowZ: -0.02,
      scale: 1,
    },
    ulna: {
      p0: [-1.25, 0.02, 0.24],
      p1: [-0.56, 0.01, 0.28],
      r0: 0.145,
      rMid: 0.132,
      r1: 0.155,
      flatY: 0.36,
      bowZ: 0.03,
      scale: 1,
    },
    olecranon: {
      p0: [-1.20, 0.02, 0.28],
      p1: [-1.42, 0.02, 0.50],
      r0: 0.11,
      rMid: 0.095,
      r1: 0.088,
      flatY: 0.36,
      bowZ: 0,
      scale: 1,
    },
    carpals: whaleCarpals,
    digits: [
      makeDigitChain([-0.14, 0.02, -0.28], -0.44, [0.30, 0.19], [0.080, 0.060], 0.10, 0.44, 2),
      makeDigitChain([-0.03, 0.02, -0.15], -0.18, [0.42, 0.38, 0.33, 0.28, 0.23, 0.18], [0.095, 0.086, 0.076, 0.066, 0.056, 0.044], 0.055, 0.42, 6),
      makeDigitChain([0.00, 0.02, 0.07], -0.02, [0.44, 0.40, 0.35, 0.29, 0.23, 0.17], [0.096, 0.085, 0.075, 0.064, 0.053, 0.040], 0.045, 0.42, 6),
      makeDigitChain([-0.04, 0.01, 0.27], 0.16, [0.35, 0.28, 0.22, 0.15], [0.082, 0.070, 0.058, 0.044], 0.045, 0.42, 4),
      makeDigitChain([-0.11, 0.00, 0.44], 0.36, [0.27, 0.20, 0.13], [0.070, 0.056, 0.043], 0.045, 0.42, 3),
    ],
    hoofScale: 0,
    hoofPos: [2.1, 0, 0],
    hoofDir: [1, 0, 0],
    tissueType: 'whale',
  };

  // 4. HORSE FORELEG (Equus caballus) — centered cleanly x ∈ [-2.4, +2.45]
  const horseCarpals: CarpalSpec[] = [
    { pos: [0.16, 0.02, -0.09], scale: [0.092, 0.075, 0.080] },
    { pos: [0.16, 0.02, 0.02], scale: [0.096, 0.080, 0.084] },
    { pos: [0.16, 0.01, 0.12], scale: [0.088, 0.074, 0.078] },
    { pos: [0.10, 0.00, 0.21], scale: [0.074, 0.064, 0.068] },
    { pos: [0.32, 0.02, -0.08], scale: [0.088, 0.074, 0.078] },
    { pos: [0.32, 0.02, 0.02], scale: [0.096, 0.080, 0.084] },
    { pos: [0.32, 0.01, 0.11], scale: [0.084, 0.072, 0.076] },
  ];

  const horse: SpeciesPose = {
    humerus: {
      p0: [-2.42, 0.04, -0.34],
      p1: [-1.30, 0.03, 0.18],
      r0: 0.185,
      rMid: 0.128,
      r1: 0.170,
      flatY: 0.84,
      bowZ: 0.03,
      scale: 1,
    },
    radius: {
      p0: [-1.24, 0.03, 0.15],
      p1: [0.10, 0.02, 0.01],
      r0: 0.140,
      rMid: 0.104,
      r1: 0.136,
      flatY: 0.86,
      bowZ: -0.02,
      scale: 1,
    },
    ulna: {
      p0: [-1.22, 0.01, 0.25],
      p1: [-0.40, 0.01, 0.12],
      r0: 0.092,
      rMid: 0.046,
      r1: 0.024,
      flatY: 0.82,
      bowZ: 0.02,
      scale: 1,
    },
    olecranon: {
      p0: [-1.20, 0.01, 0.24],
      p1: [-1.58, 0.01, 0.44],
      r0: 0.105,
      rMid: 0.094,
      r1: 0.096,
      flatY: 0.74,
      bowZ: 0,
      scale: 1,
    },
    carpals: horseCarpals,
    digits: [
      makeDigitChain([0.38, 0.02, -0.10], -0.1, [], [0.01], 0, 0.8, 0),
      // Vestigial splint bone MC II
      makeDigitChain([0.40, 0.01, -0.10], 0.045, [0.80], [0.031], 0, 0.82, 1),
      // Cannon bone MC III + pastern (P1) + short pastern (P2)
      makeDigitChain([0.40, 0.02, 0.01], 0.0, [1.14, 0.37, 0.24], [0.106, 0.092, 0.088], 0.08, 0.86, 3),
      // Vestigial splint bone MC IV
      makeDigitChain([0.40, 0.01, 0.12], -0.045, [0.78], [0.031], 0, 0.82, 1),
      makeDigitChain([0.38, 0.00, 0.14], 0.1, [], [0.01], 0, 0.8, 0),
    ],
    hoofScale: 1,
    hoofPos: [2.18, 0.02, 0.06],
    hoofDir: [0.97, 0, 0.22],
    tissueType: 'horse',
  };

  return { human, bat, whale, horse };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerpSeg(a: SegmentSpec, b: SegmentSpec, t: number): SegmentSpec {
  return {
    p0: lerp3(a.p0, b.p0, t),
    p1: lerp3(a.p1, b.p1, t),
    r0: lerp(a.r0, b.r0, t),
    rMid: lerp(a.rMid, b.rMid, t),
    r1: lerp(a.r1, b.r1, t),
    flatY: lerp(a.flatY, b.flatY, t),
    bowZ: lerp(a.bowZ, b.bowZ, t),
    scale: lerp(a.scale, b.scale, t),
  };
}

function lerpPose(a: SpeciesPose, b: SpeciesPose, t: number): SpeciesPose {
  return {
    humerus: lerpSeg(a.humerus, b.humerus, t),
    radius: lerpSeg(a.radius, b.radius, t),
    ulna: lerpSeg(a.ulna, b.ulna, t),
    olecranon: lerpSeg(a.olecranon, b.olecranon, t),
    carpals: a.carpals.map((c, idx) => ({
      pos: lerp3(c.pos, b.carpals[idx].pos, t),
      scale: lerp3(c.scale, b.carpals[idx].scale, t),
    })),
    digits: a.digits.map((digit, dIdx) =>
      digit.map((seg, sIdx) => lerpSeg(seg, b.digits[dIdx][sIdx], t))
    ),
    hoofScale: lerp(a.hoofScale, b.hoofScale, t),
    hoofPos: lerp3(a.hoofPos, b.hoofPos, t),
    hoofDir: lerp3(a.hoofDir, b.hoofDir, t),
    tissueType: t < 0.5 ? a.tissueType : b.tissueType,
  };
}

interface BoneMeshEntry {
  mesh: THREE.Mesh;
  region: BoneRegionId;
}

export interface LimbSceneCallbacks {
  onSelectRegion: (region: BoneRegionId | null) => void;
  onHoverRegion?: (region: BoneRegionId | null) => void;
}

export class LimbScene3D {
  private host: HTMLElement;
  private callbacks: LimbSceneCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  // Root groups
  private specimenPivot = new THREE.Group();
  private tetrapodGroup = new THREE.Group();
  private birdGroup = new THREE.Group();
  private insectGroup = new THREE.Group();
  private tissueGroup = new THREE.Group();

  // Materials
  private regionMaterials: Record<BoneRegionId, THREE.MeshStandardMaterial>;
  private hoxMaterials: Record<BoneRegionId, THREE.MeshStandardMaterial>;

  // Tetrapod bone meshes
  private humerusMesh!: THREE.Mesh;
  private radiusMesh!: THREE.Mesh;
  private ulnaMesh!: THREE.Mesh;
  private olecranonMesh!: THREE.Mesh;
  private carpalMeshes: THREE.Mesh[] = [];
  private digitMeshes: THREE.Mesh[][] = [];
  private hoofMesh!: THREE.Mesh;
  private clickableMeshes: BoneMeshEntry[] = [];

  // Soft tissue silhouettes
  private tissueMeshes: Record<TetrapodSpeciesId, THREE.Group>;

  // Morphing state
  private poses = buildSpeciesPoses();
  private currentPose: SpeciesPose;
  private targetPose: SpeciesPose;
  private morphSpeed = 11.0;
  private activeSpecies: TetrapodSpeciesId = 'human';
  private displayMode: 'tetrapod' | 'bird' | 'insect' = 'tetrapod';

  // Visual toggles
  private showTissue = false;
  private showHox = false;
  private selectedRegion: BoneRegionId | null = null;
  private hoveredRegion: BoneRegionId | null = null;

  // Orbit camera state (aspect-aware auto-fit!)
  private fitDist = 9.2;
  private targetAzimuth = 0.03;
  private targetPolar = 0.42;
  private targetDist = 9.2;
  private curAzimuth = 0.03;
  private curPolar = 0.42;
  private curDist = 9.2;
  private dragging = false;
  private pointerDownPos = { x: 0, y: 0 };
  private lastPointer = { x: 0, y: 0 };
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2(-99, -99);
  private clock = new THREE.Clock();

  // Reusable math objects
  private tmpV0 = new THREE.Vector3();
  private tmpV1 = new THREE.Vector3();
  private tmpDir = new THREE.Vector3();
  private tmpUp = new THREE.Vector3(0, 1, 0);
  private tmpQuat = new THREE.Quaternion();

  constructor(host: HTMLElement, callbacks: LimbSceneCallbacks) {
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
    this.renderer.toneMappingExposure = 1.07;
    this.renderer.setClearColor(0x000000, 0);

    host.appendChild(this.renderer.domElement);

    // Warm museum-plate studio lighting
    const hemi = new THREE.HemisphereLight(0xfff9ee, 0xd8c8a8, 1.18);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff6e5, 1.55);
    key.position.set(-1.6, 7.6, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 20;
    key.shadow.camera.left = -4.2;
    key.shadow.camera.right = 4.2;
    key.shadow.camera.top = 3.2;
    key.shadow.camera.bottom = -3.2;
    key.shadow.radius = 5.5;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xdcebf4, 0.58);
    rim.position.set(3.4, 2.8, -3.2);
    this.scene.add(rim);

    // Soft cast shadow catcher resting on the rag paper
    const shadowGeo = new THREE.PlaneGeometry(16, 12);
    const shadowMat = new THREE.ShadowMaterial({
      color: 0x3b2c1e,
      opacity: 0.18,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.58;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    this.regionMaterials = this.createRegionMaterials(REGION_PALETTES);
    this.hoxMaterials = this.createRegionMaterials(HOX_PALETTES);

    this.scene.add(this.specimenPivot);
    this.specimenPivot.add(this.tetrapodGroup);
    this.specimenPivot.add(this.tissueGroup);
    this.specimenPivot.add(this.birdGroup);
    this.specimenPivot.add(this.insectGroup);

    this.buildTetrapodSkeleton();
    this.tissueMeshes = this.buildSoftTissueOverlays();
    this.buildBirdWingSpecimen();
    this.buildInsectWingSpecimen();

    this.birdGroup.visible = false;
    this.insectGroup.visible = false;
    this.tissueGroup.visible = false;

    this.currentPose = lerpPose(this.poses.human, this.poses.human, 0);
    this.targetPose = this.poses.human;
    this.applyPose(this.currentPose);
    this.updateCamera();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.bindPointerEvents();
    this.animate();
  }

  /** Automatically frame the ~5.7-unit specimen nicely inside ANY plate aspect ratio */
  private computeFitDistance(aspect: number): number {
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const neededWidth = 5.75;
    const neededHeight = 3.2;
    const distForWidth = neededWidth / (2 * tanHalfFov * Math.max(aspect, 0.55));
    const distForHeight = neededHeight / (2 * tanHalfFov);
    return Math.max(6.8, distForWidth, distForHeight);
  }

  private createRegionMaterials(
    palettes: Record<BoneRegionId, { base: string; wash: string; deep: string; ivory: string }>
  ): Record<BoneRegionId, THREE.MeshStandardMaterial> {
    const out = {} as Record<BoneRegionId, THREE.MeshStandardMaterial>;
    (['stylopod', 'zeugopod', 'autopod'] as BoneRegionId[]).forEach((region) => {
      const { map, bumpMap } = createWatercolourBoneTextures(palettes[region]);
      out[region] = new THREE.MeshStandardMaterial({
        map,
        bumpMap,
        bumpScale: 0.014,
        roughness: 0.72,
        metalness: 0.02,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
      });
    });
    return out;
  }

  private registerBone(mesh: THREE.Mesh, region: BoneRegionId): THREE.Mesh {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.region = region;
    this.clickableMeshes.push({ mesh, region });
    return mesh;
  }

  private buildTetrapodSkeleton(): void {
    const longGeo = createSculptedBoneGeometry('long');
    const phalGeo = createSculptedBoneGeometry('phalanx');
    const tipGeo = createSculptedBoneGeometry('tip');
    const carpalGeo = createSculptedBoneGeometry('carpal');
    const hoofGeo = createSculptedBoneGeometry('hoof');

    this.humerusMesh = this.registerBone(
      new THREE.Mesh(longGeo, this.regionMaterials.stylopod),
      'stylopod'
    );
    this.radiusMesh = this.registerBone(
      new THREE.Mesh(longGeo, this.regionMaterials.zeugopod),
      'zeugopod'
    );
    this.ulnaMesh = this.registerBone(
      new THREE.Mesh(longGeo, this.regionMaterials.zeugopod),
      'zeugopod'
    );
    this.olecranonMesh = this.registerBone(
      new THREE.Mesh(phalGeo, this.regionMaterials.zeugopod),
      'zeugopod'
    );

    this.tetrapodGroup.add(
      this.humerusMesh,
      this.radiusMesh,
      this.ulnaMesh,
      this.olecranonMesh
    );

    for (let i = 0; i < 7; i++) {
      const m = this.registerBone(
        new THREE.Mesh(carpalGeo, this.regionMaterials.autopod),
        'autopod'
      );
      this.carpalMeshes.push(m);
      this.tetrapodGroup.add(m);
    }

    for (let d = 0; d < 5; d++) {
      const row: THREE.Mesh[] = [];
      for (let s = 0; s < 6; s++) {
        const geo = s === 0 ? longGeo : s >= 3 ? tipGeo : phalGeo;
        const m = this.registerBone(
          new THREE.Mesh(geo, this.regionMaterials.autopod),
          'autopod'
        );
        row.push(m);
        this.tetrapodGroup.add(m);
      }
      this.digitMeshes.push(row);
    }

    this.hoofMesh = this.registerBone(
      new THREE.Mesh(hoofGeo, this.regionMaterials.autopod),
      'autopod'
    );
    this.tetrapodGroup.add(this.hoofMesh);
  }

  /** Build curved organic naturalist soft-tissue envelopes for each tetrapod */
  private buildSoftTissueOverlays(): Record<TetrapodSpeciesId, THREE.Group> {
    const makeCurvedSilhouette = (
      shape: THREE.Shape,
      fillHex: number,
      opacity: number,
      edgeHex: number,
      veins?: [number, number][][]
    ): THREE.Group => {
      const g = new THREE.Group();
      const geo = new THREE.ShapeGeometry(shape, 36);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: fillHex,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = -0.055;
      g.add(mesh);

      // Smooth inked silhouette outline
      const spaced = shape.getSpacedPoints(120);
      const linePts = spaced.map((p) => new THREE.Vector3(p.x, -0.04, -p.y));
      linePts.push(linePts[0].clone());
      const borderGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      g.add(
        new THREE.Line(
          borderGeo,
          new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.48 })
        )
      );

      if (veins) {
        veins.forEach((curvePts) => {
          const c = new THREE.CatmullRomCurve3(
            curvePts.map(([x, z]) => new THREE.Vector3(x, -0.035, z))
          );
          const lg = new THREE.BufferGeometry().setFromPoints(c.getPoints(24));
          g.add(
            new THREE.Line(
              lg,
              new THREE.LineBasicMaterial({ color: edgeHex, transparent: true, opacity: 0.25 })
            )
          );
        });
      }

      g.visible = false;
      this.tissueGroup.add(g);
      return g;
    };

    // Remember Shape uses (x, -z) before rotateX(-PI/2)
    // 1. Human smooth arm & hand contour
    const humanShape = new THREE.Shape();
    humanShape.moveTo(-2.65, -0.82);
    humanShape.quadraticCurveTo(-1.7, -0.42, -0.85, -0.02);
    humanShape.quadraticCurveTo(0.15, 0.28, 0.96, 0.48);
    humanShape.quadraticCurveTo(1.32, 0.92, 1.56, 0.98);
    humanShape.quadraticCurveTo(2.2, 1.15, 2.52, 0.96);
    humanShape.quadraticCurveTo(2.65, 0.72, 2.38, 0.56);
    humanShape.quadraticCurveTo(1.65, 0.65, 1.18, 0.72);
    humanShape.quadraticCurveTo(0.05, 0.35, -0.78, -0.45);
    humanShape.quadraticCurveTo(-1.7, -0.95, -2.42, -1.26);
    humanShape.closePath();

    // 2. Bat scalloped patagium wing membrane curving tautly between digits II, III, IV, V!
    const batShape = new THREE.Shape();
    batShape.moveTo(-2.62, -0.25); // shoulder leading edge
    batShape.quadraticCurveTo(-1.6, 0.15, -0.40, 0.76); // propatagium to wrist
    batShape.quadraticCurveTo(0.65, 0.98, 1.62, 1.04); // leading edge along Digit II
    batShape.quadraticCurveTo(2.42, 0.94, 2.86, 0.68); // wingtip Digit III
    // Scalloped concave wing bays between fingertips (classic bat silhouette!)
    batShape.quadraticCurveTo(2.15, 0.28, 2.02, -0.14); // bay III -> IV
    batShape.quadraticCurveTo(1.42, -0.34, 1.05, -0.86); // bay IV -> V
    batShape.quadraticCurveTo(0.12, -0.48, -0.92, -0.72); // plagiopatagium bay V -> flank
    batShape.quadraticCurveTo(-1.85, -0.62, -2.56, -0.88);
    batShape.closePath();

    // 3. Whale smooth hydrodynamic flipper teardrop
    const whaleShape = new THREE.Shape();
    whaleShape.moveTo(-2.45, 0.12);
    whaleShape.bezierCurveTo(-1.45, 0.42, -0.20, 0.66, 0.95, 0.58);
    whaleShape.bezierCurveTo(1.78, 0.48, 2.32, 0.22, 2.34, -0.02);
    whaleShape.bezierCurveTo(2.30, -0.34, 1.68, -0.64, 0.78, -0.76);
    whaleShape.bezierCurveTo(-0.35, -0.86, -1.55, -0.76, -2.45, -0.52);
    whaleShape.closePath();

    // 4. Horse smooth foreleg, fetlock & keratin hoof envelope
    const horseShape = new THREE.Shape();
    horseShape.moveTo(-2.55, 0.60);
    horseShape.quadraticCurveTo(-1.40, 0.12, 0.25, 0.20);
    horseShape.quadraticCurveTo(1.35, 0.16, 1.98, 0.16);
    horseShape.quadraticCurveTo(2.42, 0.15, 2.58, 0.04);
    horseShape.quadraticCurveTo(2.60, -0.18, 2.36, -0.30);
    horseShape.quadraticCurveTo(1.88, -0.28, 1.52, -0.22);
    horseShape.quadraticCurveTo(0.25, -0.28, -1.35, -0.58);
    horseShape.quadraticCurveTo(-2.10, -0.42, -2.52, -0.05);
    horseShape.closePath();

    return {
      human: makeCurvedSilhouette(humanShape, 0xd8bda0, 0.22, 0x6e553e),
      bat: makeCurvedSilhouette(batShape, 0x99704c, 0.23, 0x5c3e26, [
        [[-1.4, 0.18], [-0.45, 0.62], [0.72, 0.35]],
        [[-0.9, 0.42], [0.35, 0.24], [1.45, 0.05]],
      ]),
      whale: makeCurvedSilhouette(whaleShape, 0x4c7888, 0.22, 0x2c4e5b),
      horse: makeCurvedSilhouette(horseShape, 0x8f6b47, 0.22, 0x563d26),
    };
  }

  /** Build comparative avian wing centered cleanly at x ∈ [-2.35, +2.35] */
  private buildBirdWingSpecimen(): void {
    const longGeo = createSculptedBoneGeometry('long');
    const phalGeo = createSculptedBoneGeometry('phalanx');
    const tipGeo = createSculptedBoneGeometry('tip');

    const place = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
      p0: [number, number, number],
      p1: [number, number, number],
      r: number,
      region: BoneRegionId
    ) => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      m.userData.region = region;
      this.positionBoneMesh(m, {
        p0,
        p1,
        r0: r * 1.08,
        rMid: r * 0.76,
        r1: r * 0.98,
        flatY: 0.84,
        bowZ: 0,
        scale: 1,
      });
      this.birdGroup.add(m);
    };

    // Humerus (stylopod)
    place(longGeo, this.regionMaterials.stylopod, [-2.32, 0.05, -0.10], [-1.18, 0.03, 0.30], 0.115, 'stylopod');
    // Curved radius & thicker ulna (zeugopod)
    place(longGeo, this.regionMaterials.zeugopod, [-1.12, 0.04, 0.23], [0.16, 0.03, -0.44], 0.056, 'zeugopod');
    place(longGeo, this.regionMaterials.zeugopod, [-1.12, 0.02, 0.34], [0.24, 0.02, -0.32], 0.076, 'zeugopod');
    // Fused carpometacarpus (autopod)
    place(longGeo, this.regionMaterials.autopod, [0.25, 0.03, -0.42], [1.28, 0.02, -0.58], 0.060, 'autopod');
    place(longGeo, this.regionMaterials.autopod, [0.28, 0.02, -0.32], [1.26, 0.02, -0.47], 0.038, 'autopod');
    // Alula (thumb)
    place(tipGeo, this.regionMaterials.autopod, [0.30, 0.04, -0.46], [0.74, 0.04, -0.82], 0.036, 'autopod');
    // Primary wingtip digits
    place(phalGeo, this.regionMaterials.autopod, [1.32, 0.02, -0.56], [1.96, 0.02, -0.50], 0.044, 'autopod');
    place(tipGeo, this.regionMaterials.autopod, [1.99, 0.02, -0.50], [2.40, 0.02, -0.42], 0.032, 'autopod');

    // Graceful layered primary & secondary flight feathers with rachis shafts
    const featherMat = new THREE.MeshStandardMaterial({
      color: 0xe3d6bd,
      roughness: 0.88,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    const shaftMat = new THREE.LineBasicMaterial({
      color: 0x6f5a42,
      transparent: true,
      opacity: 0.45,
    });

    const featherCount = 15;
    for (let i = 0; i < featherCount; i++) {
      const t = i / (featherCount - 1);
      const bx = lerp(-1.05, 2.08, t);
      const bz = lerp(0.28, -0.48, t);
      const len = 1.02 + 0.56 * Math.sin(t * Math.PI * 0.88);
      const angle = lerp(1.52, 0.22, t);

      const fShape = new THREE.Shape();
      fShape.moveTo(0, 0);
      fShape.quadraticCurveTo(len * 0.48, 0.145, len, 0.01);
      fShape.quadraticCurveTo(len * 0.48, -0.105, 0, 0);
      const fGeo = new THREE.ShapeGeometry(fShape, 16);
      fGeo.rotateX(-Math.PI / 2);

      const fm = new THREE.Mesh(fGeo, featherMat);
      fm.position.set(bx, -0.045 - i * 0.002, bz);
      fm.rotation.y = -angle;
      fm.castShadow = true;
      this.birdGroup.add(fm);

      const rachis = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.004, 0),
        new THREE.Vector3(len * 0.96, 0.004, 0),
      ]);
      const rl = new THREE.Line(rachis, shaftMat);
      rl.position.copy(fm.position);
      rl.rotation.y = -angle;
      this.birdGroup.add(rl);
    }
  }

  /** Build delicate chitinous insect wing (Step 5: Pure Analogy — zero bone blueprint) */
  private buildInsectWingSpecimen(): void {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(-2.45, -0.08);
    wingShape.bezierCurveTo(-1.15, 0.54, 0.85, 0.72, 2.22, 0.40);
    wingShape.bezierCurveTo(2.68, 0.26, 2.68, -0.18, 2.10, -0.42);
    wingShape.bezierCurveTo(0.85, -0.78, -0.95, -0.74, -2.18, -0.42);
    wingShape.quadraticCurveTo(-2.42, -0.30, -2.45, -0.08);

    const wingGeo = new THREE.ShapeGeometry(wingShape, 40);
    wingGeo.rotateX(-Math.PI / 2);
    const wingMat = new THREE.MeshPhysicalMaterial({
      color: 0xebdcb8,
      roughness: 0.22,
      metalness: 0.04,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
    });
    const wingMesh = new THREE.Mesh(wingGeo, wingMat);
    wingMesh.position.y = 0.02;
    wingMesh.castShadow = true;
    this.insectGroup.add(wingMesh);

    // Pterostigma cell near leading tip
    const stigGeo = new THREE.PlaneGeometry(0.42, 0.10);
    stigGeo.rotateX(-Math.PI / 2);
    const stig = new THREE.Mesh(
      stigGeo,
      new THREE.MeshBasicMaterial({ color: 0x624124, transparent: true, opacity: 0.78 })
    );
    stig.position.set(1.66, 0.036, -0.44);
    stig.rotation.y = -0.22;
    this.insectGroup.add(stig);

    // Delicate fine chitinous longitudinal veins
    const veinMat = new THREE.MeshStandardMaterial({
      color: 0x6b4d31,
      roughness: 0.52,
      metalness: 0.05,
    });
    const addVein = (coords: [number, number][], r: number) => {
      const curve = new THREE.CatmullRomCurve3(
        coords.map(([x, z]) => new THREE.Vector3(x, 0.032, z))
      );
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, r, 6, false), veinMat);
      tube.castShadow = true;
      this.insectGroup.add(tube);
    };

    // Costa, Subcosta, Radius, Media, Cubitus, Anal veins (slender & crisp)
    addVein([[-2.45, 0.08], [-1.10, -0.46], [0.85, -0.62], [2.22, -0.38], [2.58, -0.04]], 0.017);
    addVein([[-2.40, 0.12], [-0.92, -0.28], [0.92, -0.40], [2.42, -0.08]], 0.012);
    addVein([[-2.32, 0.18], [-0.70, -0.02], [1.10, -0.08], [2.30, 0.18]], 0.011);
    addVein([[-2.25, 0.24], [-0.50, 0.26], [1.02, 0.30], [1.92, 0.40]], 0.010);
    addVein([[-2.15, 0.36], [-0.88, 0.62], [0.82, 0.64], [2.10, 0.42]], 0.013);

    // Fine dragonfly cell cross-venation
    const crossMat = new THREE.LineBasicMaterial({ color: 0x735438, transparent: true, opacity: 0.42 });
    for (let x = -1.75; x <= 2.05; x += 0.26) {
      const topZ = -0.58 + 0.055 * Math.pow(x - 0.35, 2);
      const botZ = 0.60 - 0.045 * Math.pow(x - 0.15, 2);
      const lg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0.034, topZ),
        new THREE.Vector3(x + 0.06, 0.034, botZ),
      ]);
      this.insectGroup.add(new THREE.Line(lg, crossMat));
    }
  }

  private positionBoneMesh(mesh: THREE.Mesh, spec: SegmentSpec): void {
    // Crisp hide threshold prevents tiny lingering dots during Horse digit-reduction morph
    if (spec.scale < 0.08) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    this.tmpV0.set(spec.p0[0], spec.p0[1], spec.p0[2]);
    this.tmpV1.set(spec.p1[0], spec.p1[1], spec.p1[2]);
    this.tmpDir.subVectors(this.tmpV1, this.tmpV0);
    const len = this.tmpDir.length();
    if (len < 0.01) {
      mesh.visible = false;
      return;
    }

    mesh.position.copy(this.tmpV0);
    this.tmpDir.normalize();
    this.tmpQuat.setFromUnitVectors(this.tmpUp, this.tmpDir);
    mesh.quaternion.copy(this.tmpQuat);

    const r = ((spec.r0 + spec.rMid + spec.r1) / 3) * spec.scale;
    mesh.scale.set(r, len * spec.scale, r * spec.flatY);
  }

  private applyPose(pose: SpeciesPose): void {
    this.positionBoneMesh(this.humerusMesh, pose.humerus);
    this.positionBoneMesh(this.radiusMesh, pose.radius);
    this.positionBoneMesh(this.ulnaMesh, pose.ulna);
    this.positionBoneMesh(this.olecranonMesh, pose.olecranon);

    for (let i = 0; i < this.carpalMeshes.length; i++) {
      const c = pose.carpals[i];
      const m = this.carpalMeshes[i];
      m.position.set(c.pos[0], c.pos[1], c.pos[2]);
      m.scale.set(c.scale[0], c.scale[1], c.scale[2]);
    }

    for (let d = 0; d < this.digitMeshes.length; d++) {
      for (let s = 0; s < this.digitMeshes[d].length; s++) {
        this.positionBoneMesh(this.digitMeshes[d][s], pose.digits[d][s]);
      }
    }

    if (pose.hoofScale > 0.08) {
      this.hoofMesh.visible = true;
      this.hoofMesh.position.set(pose.hoofPos[0], pose.hoofPos[1], pose.hoofPos[2]);
      this.tmpDir.set(pose.hoofDir[0], pose.hoofDir[1], pose.hoofDir[2]).normalize();
      this.tmpQuat.setFromUnitVectors(this.tmpUp, this.tmpDir);
      this.hoofMesh.quaternion.copy(this.tmpQuat);
      this.hoofMesh.scale.set(
        0.165 * pose.hoofScale,
        0.24 * pose.hoofScale,
        0.15 * pose.hoofScale
      );
    } else {
      this.hoofMesh.visible = false;
    }

    this.updateTissueVisibility(this.activeSpecies);
  }

  private updateTissueVisibility(activeType: TetrapodSpeciesId): void {
    this.tissueGroup.visible = this.showTissue && this.displayMode === 'tetrapod';
    (Object.keys(this.tissueMeshes) as TetrapodSpeciesId[]).forEach((k) => {
      this.tissueMeshes[k].visible = k === activeType;
    });
  }

  private updateMaterials(): void {
    const mats = this.showHox ? this.hoxMaterials : this.regionMaterials;

    this.clickableMeshes.forEach(({ mesh, region }) => {
      mesh.material = mats[region];
    });

    (['stylopod', 'zeugopod', 'autopod'] as BoneRegionId[]).forEach((region) => {
      const mat = mats[region];
      const isSelected = this.selectedRegion === region;
      const isHovered = this.hoveredRegion === region;
      const somethingSelected = this.selectedRegion !== null;

      if (isSelected) {
        mat.emissive.setHex(0x4b2a10);
        mat.emissiveIntensity = 0.36;
        mat.opacity = 1;
        mat.transparent = false;
      } else if (isHovered) {
        mat.emissive.setHex(0x3a240e);
        mat.emissiveIntensity = 0.22;
        mat.opacity = 1;
        mat.transparent = false;
      } else if (somethingSelected) {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.transparent = true;
        mat.opacity = 0.4;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        mat.transparent = false;
        mat.opacity = 1;
      }
      mat.needsUpdate = true;
    });
  }

  public setSpecies(species: TetrapodSpeciesId): void {
    this.displayMode = 'tetrapod';
    this.activeSpecies = species;
    this.tetrapodGroup.visible = true;
    this.birdGroup.visible = false;
    this.insectGroup.visible = false;
    this.targetPose = this.poses[species];
    this.updateTissueVisibility(species);
  }

  public setContinuousMorph(value: number): void {
    this.displayMode = 'tetrapod';
    this.tetrapodGroup.visible = true;
    this.birdGroup.visible = false;
    this.insectGroup.visible = false;

    const order: TetrapodSpeciesId[] = ['human', 'bat', 'whale', 'horse'];
    const clamped = Math.max(0, Math.min(3, value));
    const idx = Math.min(2, Math.floor(clamped));
    const frac = clamped - idx;
    const pose = lerpPose(this.poses[order[idx]], this.poses[order[idx + 1]], frac);
    this.targetPose = pose;
    this.currentPose = pose;
    this.applyPose(pose);
  }

  public setAnalogySpecimen(specimen: AnalogySpecimenId): void {
    if (specimen === 'bat') {
      this.setSpecies('bat');
      this.setShowTissue(true);
      return;
    }
    this.displayMode = specimen;
    this.tetrapodGroup.visible = false;
    this.tissueGroup.visible = false;
    this.birdGroup.visible = specimen === 'bird';
    this.insectGroup.visible = specimen === 'insect';
  }

  public setSelectedRegion(region: BoneRegionId | null): void {
    this.selectedRegion = region;
    this.updateMaterials();
  }

  public setShowTissue(on: boolean): void {
    this.showTissue = on;
    this.updateTissueVisibility(this.activeSpecies);
  }

  public setShowHox(on: boolean): void {
    this.showHox = on;
    this.updateMaterials();
  }

  public resetView(): void {
    this.targetAzimuth = 0.03;
    this.targetPolar = 0.42;
    this.targetDist = this.fitDist;
  }

  public resize(): void {
    if (this.disposed) return;
    const w = Math.max(this.host.clientWidth, 240);
    const h = Math.max(this.host.clientHeight, 240);
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    const prevFit = this.fitDist;
    this.fitDist = this.computeFitDistance(aspect);
    // Keep zoom proportion consistent across viewport resizes
    if (Math.abs(this.targetDist - prevFit) < 0.5) {
      this.targetDist = this.fitDist;
      this.curDist = this.fitDist;
    }
  }

  private updateCamera(): void {
    const x = Math.sin(this.curAzimuth) * Math.sin(this.curPolar) * this.curDist;
    const y = Math.cos(this.curPolar) * this.curDist;
    const z = Math.cos(this.curAzimuth) * Math.sin(this.curPolar) * this.curDist;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0.0, -0.04, 0.02);
  }

  private bindPointerEvents(): void {
    const el = this.renderer.domElement;

    const updateNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      this.pointerNdc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.pointerNdc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };

    const pickRegion = (): BoneRegionId | null => {
      if (this.displayMode !== 'tetrapod') return null;
      this.raycaster.setFromCamera(this.pointerNdc, this.camera);
      const meshes = this.clickableMeshes
        .filter((e) => e.mesh.visible)
        .map((e) => e.mesh);
      const hits = this.raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        return (hits[0].object.userData.region as BoneRegionId) ?? null;
      }
      return null;
    };

    el.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
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
        this.targetPolar = Math.max(0.14, Math.min(1.22, this.targetPolar - dy * 0.0055));
      } else {
        const hit = pickRegion();
        if (hit !== this.hoveredRegion) {
          this.hoveredRegion = hit;
          el.style.cursor = hit ? 'pointer' : 'grab';
          this.updateMaterials();
          this.callbacks.onHoverRegion?.(hit);
        }
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
      const dist = Math.hypot(
        e.clientX - this.pointerDownPos.x,
        e.clientY - this.pointerDownPos.y
      );
      if (dist < 6) {
        updateNdc(e);
        const hit = pickRegion();
        if (hit) {
          this.selectedRegion = this.selectedRegion === hit ? null : hit;
        } else {
          this.selectedRegion = null;
        }
        this.updateMaterials();
        this.callbacks.onSelectRegion(this.selectedRegion);
      }
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const minD = this.fitDist * 0.55;
        const maxD = this.fitDist * 1.45;
        this.targetDist = Math.max(minD, Math.min(maxD, this.targetDist + e.deltaY * 0.004));
      },
      { passive: false }
    );
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = window.requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    const alpha = 1 - Math.exp(-this.morphSpeed * dt);
    this.currentPose = lerpPose(this.currentPose, this.targetPose, alpha);
    if (this.displayMode === 'tetrapod') {
      this.applyPose(this.currentPose);
    }

    this.specimenPivot.position.y = Math.sin(elapsed * 1.4) * 0.025;

    const camAlpha = 1 - Math.exp(-10 * dt);
    this.curAzimuth = lerp(this.curAzimuth, this.targetAzimuth, camAlpha);
    this.curPolar = lerp(this.curPolar, this.targetPolar, camAlpha);
    this.curDist = lerp(this.curDist, this.targetDist, camAlpha);
    this.updateCamera();

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.disposed = true;
    this.resizeObserver.disconnect();
    window.cancelAnimationFrame(this.rafId);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
