import * as THREE from 'three';

export interface WatercolourWashPalette {
  /** Mid-tone pigment wash (e.g. warm ochre, botanical teal, rose-crimson) */
  base: string;
  /** Light rag-paper highlight wash */
  wash: string;
  /** Deep pigment + sepia crevice shadow */
  deep: string;
  /** Dip-pen sepia ink outline color */
  ink?: string;
}

export interface WatercolourMaterialHandle {
  material: THREE.ShaderMaterial;
  setPalette(palette: WatercolourWashPalette): void;
  setEmphasis(state: 'normal' | 'selected' | 'hovered' | 'dimmed'): void;
}

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 color;
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec3 vObjPos;
  varying float vCreviceAO;

  void main() {
    vObjPos = position;
    #ifdef USE_VERTEX_AO
      vCreviceAO = color.r;
    #else
      vCreviceAO = 0.88;
    #endif
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uWashColor;
  uniform vec3 uDeepColor;
  uniform vec3 uInkColor;
  uniform vec3 uPaperColor;
  uniform float uHighlight;
  uniform float uDim;
  uniform float uGrainScale;
  uniform float uInkStrength;

  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec3 vObjPos;
  varying float vCreviceAO;

  // Compact 3D value noise for seam-free cold-press rag paper & watercolour granulation
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise3(p);
      p = p * 2.07 + vec3(13.7, -7.3, 5.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormalView);
    vec3 V = normalize(vViewPos);

    // Soft north-light museum studio illumination (wrap diffuse, zero plastic specular)
    vec3 keyDir = normalize(vec3(-0.35, 0.85, 0.55));
    vec3 fillDir = normalize(vec3(0.55, 0.25, -0.45));
    float ndlKey = dot(N, keyDir);
    float wrapKey = clamp((ndlKey + 0.52) / 1.52, 0.0, 1.0);
    float wrapFill = clamp((dot(N, fillDir) + 0.4) / 1.4, 0.0, 1.0);
    float light = clamp(0.42 + 0.54 * wrapKey + 0.14 * wrapFill, 0.0, 1.0);

    // Multi-scale watercolour wash + fine cold-press paper granulation
    float washMottle = fbm(vObjPos * uGrainScale * 2.2);
    float fineGrain = noise3(vObjPos * uGrainScale * 18.0);
    float paperTooth = noise3(vec3(gl_FragCoord.xy * 0.42, 1.7));

    // Combine lighting, baked bone crevice AO, and pigment mottling
    float ao = smoothstep(0.36, 0.96, vCreviceAO);
    float pigmentT = clamp(light * 0.72 + ao * 0.34 + (washMottle - 0.5) * 0.26, 0.0, 1.0);

    // 3-stop watercolour ramp: deep crevice pigment -> mid wash -> luminous rag highlight
    vec3 col = mix(uDeepColor, uBaseColor, smoothstep(0.18, 0.62, pigmentT));
    col = mix(col, uWashColor, smoothstep(0.56, 0.96, pigmentT));

    // Subtle paper grain & pigment granulation
    col *= 0.94 + 0.10 * fineGrain + 0.04 * (paperTooth - 0.5);

    // Watercolor wet-edge pigment pooling + delicate dip-pen sepia contour (Fresnel rim)
    float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
    float edgeBand = pow(1.0 - ndv, 2.35);
    float inkLine = smoothstep(0.48, 0.86, 1.0 - ndv) * uInkStrength;
    float creviceInk = (1.0 - ao) * 0.52 * uInkStrength;

    // Edge pooling darkens toward deeper pigment first, then thin sepia contour at silhouette
    col = mix(col, uDeepColor * 0.86, edgeBand * 0.42);
    col = mix(col, uInkColor, clamp(inkLine * 0.68 + creviceInk, 0.0, 0.78));

    // Selection / hover emphasis & soft rag-paper dimming for unselected regions
    col = mix(col, uPaperColor, uDim * 0.52);
    col = mix(col, min(col * 1.14 + vec3(0.05, 0.04, 0.02), vec3(1.0)), uHighlight);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createMuseumWatercolourMaterial(
  palette: WatercolourWashPalette,
  options: { hasVertexAO?: boolean; grainScale?: number; inkStrength?: number } = {}
): WatercolourMaterialHandle {
  const { hasVertexAO = true, grainScale = 1.6, inkStrength = 0.85 } = options;

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    defines: hasVertexAO ? { USE_VERTEX_AO: 1 } : {},
    uniforms: {
      uBaseColor: { value: new THREE.Color(palette.base) },
      uWashColor: { value: new THREE.Color(palette.wash) },
      uDeepColor: { value: new THREE.Color(palette.deep) },
      uInkColor: { value: new THREE.Color(palette.ink ?? '#4d3624') },
      uPaperColor: { value: new THREE.Color('#f4efe2') },
      uHighlight: { value: 0.0 },
      uDim: { value: 0.0 },
      uGrainScale: { value: grainScale },
      uInkStrength: { value: inkStrength },
    },
    side: THREE.FrontSide,
  });

  return {
    material,
    setPalette(next: WatercolourWashPalette) {
      material.uniforms.uBaseColor.value.set(next.base);
      material.uniforms.uWashColor.value.set(next.wash);
      material.uniforms.uDeepColor.value.set(next.deep);
      if (next.ink) material.uniforms.uInkColor.value.set(next.ink);
    },
    setEmphasis(state: 'normal' | 'selected' | 'hovered' | 'dimmed') {
      if (state === 'selected') {
        material.uniforms.uHighlight.value = 0.55;
        material.uniforms.uDim.value = 0.0;
      } else if (state === 'hovered') {
        material.uniforms.uHighlight.value = 0.35;
        material.uniforms.uDim.value = 0.0;
      } else if (state === 'dimmed') {
        material.uniforms.uHighlight.value = 0.0;
        material.uniforms.uDim.value = 0.72;
      } else {
        material.uniforms.uHighlight.value = 0.0;
        material.uniforms.uDim.value = 0.0;
      }
    },
  };
}
