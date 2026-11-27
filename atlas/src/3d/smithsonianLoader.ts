import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  createMuseumWatercolourMaterial,
  type WatercolourWashPalette,
} from './watercolourMaterial';

const TEMPLATE_CACHE = new Map<string, Promise<THREE.Group>>();

async function loadTemplate(url: string): Promise<THREE.Group> {
  const existing = TEMPLATE_CACHE.get(url);
  if (existing) return existing;

  const promise = (async () => {
    await MeshoptDecoder.ready;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(url);
    return gltf.scene;
  })();

  TEMPLATE_CACHE.set(url, promise);
  return promise;
}

export interface SmithsonianMountOptions {
  /** Target maximum bounding dimension in scene units (default 2.2) */
  size?: number;
  /** Watercolour palette for the museum-plate shader */
  palette: WatercolourWashPalette;
  /** Grain frequency scale (default 1.8) */
  grainScale?: number;
  /** Sepia-ink contour strength (default 0.85) */
  inkStrength?: number;
  /** Optional Euler rotation [rx, ry, rz] applied to the specimen */
  rotation?: [number, number, number];
  /** Optional position offset [x, y, z] */
  position?: [number, number, number];
  /** If true, places the bottom of the specimen's bounding box at y = 0 */
  groundOnY0?: boolean;
  /** Optional callback after the real scan mounts */
  onLoaded?: (group: THREE.Group) => void;
}

/**
 * Creates an immediately usable THREE.Group placeholder and asynchronously populates it
 * with a real Smithsonian CC0 3D scan painted with our watercolour & sepia-ink shader.
 * Works 100% offline via data-URI inlined GLBs under file:// and HTTP.
 */
export function createSmithsonianSpecimen(
  glbUrl: string,
  options: SmithsonianMountOptions
): THREE.Group {
  const host = new THREE.Group();
  if (options.position) {
    host.position.set(options.position[0], options.position[1], options.position[2]);
  }

  void loadTemplate(glbUrl)
    .then((template) => {
      const clone = template.clone(true);
      const { material } = createMuseumWatercolourMaterial(options.palette, {
        hasVertexAO: true,
        grainScale: options.grainScale ?? 1.8,
        inkStrength: options.inkStrength ?? 0.85,
      });

      clone.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.material = material;
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });

      if (options.rotation) {
        clone.rotation.set(options.rotation[0], options.rotation[1], options.rotation[2]);
      }

      // Normalize to target size cleanly
      clone.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(clone);
      const sz = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(sz.x, sz.y, sz.z) || 1;
      const targetSize = options.size ?? 2.2;
      const scale = targetSize / maxDim;

      const inner = new THREE.Group();
      inner.add(clone);
      clone.position.sub(center);
      inner.scale.setScalar(scale);

      if (options.groundOnY0) {
        inner.updateMatrixWorld(true);
        const b2 = new THREE.Box3().setFromObject(inner);
        inner.position.y -= b2.min.y;
      }

      host.add(inner);
      options.onLoaded?.(host);
    })
    .catch((err) => {
      console.warn('Smithsonian specimen load failed:', err);
    });

  return host;
}
