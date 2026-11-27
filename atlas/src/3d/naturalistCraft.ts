// =============================================================================
// Endless Forms Atlas — Natural-History Watercolour & Ink 3D Craft Engine
// Inspired by museum botanical/osteological plates (Audubon, Haeckel, Owen):
// - Continuous organic lofted BufferGeometry (ZERO clunky sphere/cone seams!)
// - Hand-tinted 512x512 watercolour wash + organic pattern + bump textures
// - Subtle sepia-ink Fresnel silhouette rim darkening (zero plastic glare!)
// - Clean soft paper shadows with ZERO floating 3D HTML-like text boxes!
// =============================================================================

import * as THREE from 'three';

export interface WatercolourPalette {
  base: string;
  wash: string;
  deep: string;
  highlight: string;
  ink?: string;
}

export type NaturalistPattern =
  | 'bone'
  | 'feather'
  | 'fur'
  | 'scale'
  | 'botanical'
  | 'fruit'
  | 'strata'
  | 'keratin'
  | 'kelp'
  | 'tissue';

/**
 * Generates a 512x512 hand-tinted watercolour albedo + organic micro-bump texture pair.
 * Matches the tactile matte museum-plate craft of Plate 11 (Same Bones, Different Lives).
 */
export function createWatercolourTextures(
  palette: WatercolourPalette,
  pattern: NaturalistPattern = 'bone',
  seed = 1337
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;

  const bc = document.createElement('canvas');
  bc.width = size;
  bc.height = size;
  const bctx = bc.getContext('2d')!;
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, size, size);

  let s = seed >>> 0 || 1337;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // 1. Soft multi-stop watercolour gradient wash
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0.0, palette.deep);
  grad.addColorStop(0.16, palette.wash);
  grad.addColorStop(0.45, palette.base);
  grad.addColorStop(0.68, palette.highlight);
  grad.addColorStop(0.88, palette.wash);
  grad.addColorStop(1.0, palette.deep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // 2. Layered organic pigment blooms (authentic rag-paper pigment pooling)
  for (let i = 0; i < 240; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const rx = 14 + rand() * 52;
    const ry = 16 + rand() * 64;
    ctx.save();
    ctx.globalAlpha = 0.045 + rand() * 0.035;
    ctx.fillStyle = i % 3 === 0 ? palette.highlight : i % 2 === 0 ? palette.wash : palette.deep;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const ink = palette.ink ?? '#332418';

  // 3. Domain-specific anatomical linework & micro-relief bump map
  if (pattern === 'feather') {
    // Delicate overlapping feather barbs & rachis quill lines
    for (let row = 0; row < 14; row++) {
      const yBase = (row / 14) * size;
      for (let col = 0; col < 10; col++) {
        const xBase = ((col + (row % 2) * 0.5) / 10) * size;
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.16;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(xBase, yBase, 24, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        // Fine barbs radiating along each feather
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 0.8;
        for (let b = -3; b <= 3; b++) {
          ctx.beginPath();
          ctx.moveTo(xBase, yBase - 6);
          ctx.lineTo(xBase + b * 6, yBase + 18);
          ctx.stroke();
        }
        ctx.restore();

        bctx.strokeStyle = 'rgba(255,255,255,0.18)';
        bctx.lineWidth = 2;
        bctx.beginPath();
        bctx.arc(xBase, yBase, 23, 0.15 * Math.PI, 0.85 * Math.PI);
        bctx.stroke();
      }
    }
  } else if (pattern === 'fur') {
    // Hundreds of fine directional brush hairs
    for (let i = 0; i < 950; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 10 + rand() * 22;
      const ang = (rand() - 0.5) * 0.3;
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = i % 3 === 0 ? palette.highlight : i % 2 === 0 ? palette.deep : ink;
      ctx.lineWidth = 0.9 + rand() * 0.9;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(ang) * len, y + Math.cos(ang) * len);
      ctx.stroke();
      ctx.restore();

      bctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
      bctx.lineWidth = 1.1;
      bctx.beginPath();
      bctx.moveTo(x, y);
      bctx.lineTo(x + Math.sin(ang) * len, y + Math.cos(ang) * len);
      bctx.stroke();
    }
  } else if (pattern === 'scale') {
    // Imbricated natural-history fish/reptile scales with ink edge
    for (let row = 0; row < 16; row++) {
      const y = (row / 16) * size;
      for (let col = 0; col < 14; col++) {
        const x = ((col + (row % 2) * 0.5) / 14) * size;
        ctx.save();
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.restore();

        bctx.strokeStyle = 'rgba(255,255,255,0.22)';
        bctx.lineWidth = 2.2;
        bctx.beginPath();
        bctx.arc(x, y, 17, 0.1 * Math.PI, 0.9 * Math.PI);
        bctx.stroke();
      }
    }
  } else if (pattern === 'botanical' || pattern === 'kelp') {
    // Delicate botanical midrib and curving pinnate veins
    ctx.save();
    ctx.strokeStyle = palette.highlight;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size / 2, size);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 14; i++) {
      const y = (i / 14) * size;
      ctx.beginPath();
      ctx.moveTo(size / 2, y);
      ctx.quadraticCurveTo(size * 0.25, y - 16, 16, y - 48);
      ctx.moveTo(size / 2, y);
      ctx.quadraticCurveTo(size * 0.75, y - 16, size - 16, y - 48);
      ctx.stroke();
    }
    ctx.restore();

    bctx.strokeStyle = 'rgba(255,255,255,0.28)';
    bctx.lineWidth = 3;
    bctx.beginPath();
    bctx.moveTo(size / 2, 0);
    bctx.lineTo(size / 2, size);
    bctx.stroke();
  } else if (pattern === 'strata') {
    // Sedimentary geological bedding laminae + mineral grain stipple
    for (let i = 0; i < 48; i++) {
      const y = (i / 48) * size;
      ctx.save();
      ctx.globalAlpha = 0.14 + rand() * 0.16;
      ctx.strokeStyle = i % 3 === 0 ? palette.deep : i % 2 === 0 ? ink : palette.highlight;
      ctx.lineWidth = 2 + rand() * 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 32) {
        ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * 3.5);
      }
      ctx.stroke();
      ctx.restore();

      bctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      bctx.lineWidth = 3;
      bctx.beginPath();
      bctx.moveTo(0, y);
      bctx.lineTo(size, y);
      bctx.stroke();
    }
  } else {
    // Bone / Keratin / Fruit / Tissue longitudinal organic grain + ink stippling
    ctx.save();
    ctx.globalAlpha = 0.11;
    ctx.strokeStyle = ink;
    for (let i = 0; i < 140; i++) {
      const x = rand() * size;
      ctx.lineWidth = 0.7 + rand() * 1.1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(
        x + (rand() - 0.5) * 14,
        size * 0.33,
        x + (rand() - 0.5) * 14,
        size * 0.66,
        x,
        size
      );
      ctx.stroke();
    }
    ctx.restore();

    for (let i = 0; i < 320; i++) {
      const x = rand() * size;
      const y = rand() * size;
      bctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
      bctx.beginPath();
      bctx.arc(x, y, 1.2 + rand() * 2.6, 0, Math.PI * 2);
      bctx.fill();
    }
  }

  // 4. Fine archival sepia ink stipple across every texture for unified book-plate cohesion
  ctx.save();
  ctx.fillStyle = ink;
  for (let i = 0; i < 360; i++) {
    ctx.globalAlpha = 0.045 + rand() * 0.05;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, 0.7 + rand() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bc);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

const NATURALIST_MAT_CACHE = new Map<string, THREE.MeshStandardMaterial>();

/**
 * Creates (or returns cached) matte hand-illustrated natural-history watercolour material with
 * subtle Fresnel sepia-ink silhouette rim darkening (matching iamtechartist.com/evolution!).
 */
export function createNaturalistMaterial(
  palette: WatercolourPalette,
  pattern: NaturalistPattern = 'bone',
  options?: {
    roughness?: number;
    bumpScale?: number;
    transparent?: boolean;
    opacity?: number;
    side?: THREE.Side;
    seed?: number;
    inkStrength?: number;
  }
): THREE.MeshStandardMaterial {
  const key = [
    palette.base,
    palette.wash,
    palette.deep,
    palette.highlight,
    palette.ink ?? '#3b291a',
    pattern,
    options?.roughness ?? 0.84,
    options?.bumpScale ?? 0.022,
    options?.transparent ? 1 : 0,
    options?.opacity ?? 1.0,
    options?.side ?? THREE.FrontSide,
    options?.inkStrength ?? 0.48,
  ].join('|');

  const cached = NATURALIST_MAT_CACHE.get(key);
  if (cached) return cached;

  const { map, bumpMap } = createWatercolourTextures(palette, pattern, options?.seed ?? 1337);
  const inkColor = new THREE.Color(palette.ink ?? '#3b291a');
  const inkStrength = options?.inkStrength ?? 0.48;

  const mat = new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: options?.bumpScale ?? 0.016,
    roughness: options?.roughness ?? 0.94,
    metalness: 0.0,
    transparent: options?.transparent ?? false,
    opacity: options?.opacity ?? 1.0,
    side: options?.side ?? THREE.FrontSide,
  });

  // Inject cold-press rag-paper tooth + delicate sepia-ink Fresnel silhouette darkening
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uInkColor = { value: inkColor };
    shader.uniforms.uInkStrength = { value: inkStrength };
    shader.fragmentShader =
      `uniform vec3 uInkColor;\nuniform float uInkStrength;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      vec3 viewDirInk = normalize(vViewPosition);
      float ndvInk = clamp(abs(dot(normalize(normal), viewDirInk)), 0.0, 1.0);
      float edgeWash = pow(1.0 - ndvInk, 2.2) * 0.28;
      float rimInk = smoothstep(0.45, 0.88, 1.0 - ndvInk) * uInkStrength * 0.72;
      float tooth = fract(sin(dot(floor(gl_FragCoord.xy * 0.65), vec2(12.9898, 78.233))) * 43758.5453);
      gl_FragColor.rgb *= (0.965 + 0.055 * tooth);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.80, edgeWash);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, uInkColor, rimInk);
      #include <dithering_fragment>
      `
    );
  };
  mat.customProgramCacheKey = () => `naturalist_paper_ink_${inkStrength.toFixed(2)}`;

  NATURALIST_MAT_CACHE.set(key, mat);
  return mat;
}

/**
 * Smooth continuous organic lofting along a 3D CatmullRomCurve3 with custom
 * radial profile r(t) and elliptical aspect (sx(t), sy(t)) + smooth hemispherical endcaps.
 * Eliminates clunky glued spheres/cylinders completely!
 */
export function createOrganicLoftGeometry(
  curve: THREE.Curve<THREE.Vector3>,
  radiusAt: (t: number) => number,
  options?: {
    tubularSegs?: number;
    radialSegs?: number;
    aspectAt?: (t: number) => [number, number]; // [widthScale, heightScale]
    noiseAmp?: number;
    closedCaps?: boolean;
  }
): THREE.BufferGeometry {
  const tubularSegs = options?.tubularSegs ?? 36;
  const radialSegs = options?.radialSegs ?? 24;
  const aspectAt = options?.aspectAt ?? (() => [1, 1] as [number, number]);
  const noiseAmp = options?.noiseAmp ?? 0.0;
  const closedCaps = options?.closedCaps ?? true;

  const frames = curve.computeFrenetFrames(tubularSegs, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegs; i++) {
    const t = i / tubularSegs;
    const pt = curve.getPointAt(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Smooth hemispherical taper at ends when closedCaps is true
    let capFactor = 1.0;
    if (closedCaps) {
      if (t < 0.04) capFactor = Math.sqrt(Math.max(0, 1 - Math.pow((0.04 - t) / 0.04, 2)));
      else if (t > 0.96) capFactor = Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.96) / 0.04, 2)));
    }
    const baseR = Math.max(0.0005, radiusAt(t) * capFactor);
    const [sx, sy] = aspectAt(t);

    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const theta = u * Math.PI * 2;
      const micro =
        noiseAmp > 0
          ? 1 + noiseAmp * Math.sin(t * 19.0 + theta * 3.0) * Math.cos(theta * 5.0 - t * 11.0)
          : 1;
      const cx = Math.cos(theta) * baseR * sx * micro;
      const cy = Math.sin(theta) * baseR * sy * micro;

      const vx = pt.x + cx * N.x + cy * B.x;
      const vy = pt.y + cx * N.y + cy * B.y;
      const vz = pt.z + cx * N.z + cy * B.z;
      positions.push(vx, vy, vz);
      uvs.push(u, t);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < tubularSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
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

/**
 * Sets up the unified sunlit museum rag-paper Three.js studio lighting & soft contact shadow catcher
 * (identical visual serenity to Plate 11 & iamtechartist.com/evolution/).
 */
export function setupNaturalistLighting(scene: THREE.Scene): void {
  scene.add(new THREE.HemisphereLight(0xfffdf7, 0xe5dac6, 1.15));

  const key = new THREE.DirectionalLight(0xfff7e8, 1.18);
  key.position.set(4.2, 10.5, 4.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  const d = 5.2;
  key.shadow.camera.left = -d;
  key.shadow.camera.right = d;
  key.shadow.camera.top = d;
  key.shadow.camera.bottom = -d;
  key.shadow.radius = 4.2;
  key.shadow.bias = -0.0004;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xdbeaf2, 0.42);
  rim.position.set(-5.0, 4.2, -4.5);
  scene.add(rim);

  const paperShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 28),
    new THREE.ShadowMaterial({ opacity: 0.115 })
  );
  paperShadow.rotation.x = -Math.PI / 2;
  paperShadow.position.y = 0;
  paperShadow.receiveShadow = true;
  scene.add(paperShadow);
}
