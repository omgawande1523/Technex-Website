import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createHumanGeometry,
  createExosuitGeometry,
  createConsoleGeometry,
  createSubmarineGeometry,
  createDroneGeometry,
  createRocketGeometry,
  createCircuitChipGeometry,
  createLightBulbGeometry,
  createBoatGeometry,
  createRoboticArmGeometry,
  createJetGeometry,
  createGearGeometry,
  createNeuralCoreGeometry,
  createSuspensionBridgeGeometry,
  mergeGeometries,
} from './procedural-forms';

const TARGET_HEIGHT = 2.2; // Normalized height for all forms above the pedestal

export interface SampledFormData {
  id: string;
  texture: THREE.DataTexture;
  points: Float32Array; // raw (x, y, z, edgeWeight)
}

/**
 * Normalizes a BufferGeometry so that its height equals TARGET_HEIGHT
 * and it is centered at (0, 0, 0).
 */
export function normalizeGeometry(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  geo.computeBoundingBox();
  const box = geo.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Center at origin
  geo.translate(-center.x, -center.y, -center.z);

  // Scale height to TARGET_HEIGHT
  const scale = size.y > 0.001 ? TARGET_HEIGHT / size.y : 1.0;
  geo.scale(scale, scale, scale);

  return geo;
}

/**
 * Samples points from a geometry:
 * - 70% from mesh surfaces using MeshSurfaceSampler
 * - 30% from edge contours using EdgesGeometry for constellation hollow shell look
 */
export function sampleGeometry(geo: THREE.BufferGeometry, count: number): Float32Array {
  const normalized = normalizeGeometry(geo.clone());
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(normalized, material);

  const sampler = new MeshSurfaceSampler(mesh).build();

  const edgeCount = Math.floor(count * 0.30);
  const surfaceCount = count - edgeCount;

  const data = new Float32Array(count * 4);

  // 1. Surface samples (70%)
  const tempPos = new THREE.Vector3();
  const tempNormal = new THREE.Vector3();
  for (let i = 0; i < surfaceCount; i++) {
    sampler.sample(tempPos, tempNormal);
    const idx = i * 4;
    data[idx] = tempPos.x;
    data[idx + 1] = tempPos.y;
    data[idx + 2] = tempPos.z;
    data[idx + 3] = 0.5; // surface weight
  }

  // 2. Edge samples (30%) using WireframeGeometry for ultra-fast edge sampling
  const wireframe = new THREE.WireframeGeometry(normalized);
  const posAttr = wireframe.getAttribute('position') as THREE.BufferAttribute;

  if (posAttr && posAttr.count > 1) {
    const totalVerts = posAttr.count;
    for (let i = 0; i < edgeCount; i++) {
      const seg = Math.floor(Math.random() * ((totalVerts - 1) / 2)) * 2;
      const t = Math.random();
      const x1 = posAttr.getX(seg);
      const y1 = posAttr.getY(seg);
      const z1 = posAttr.getZ(seg);
      const x2 = posAttr.getX(seg + 1);
      const y2 = posAttr.getY(seg + 1);
      const z2 = posAttr.getZ(seg + 1);

      const idx = (surfaceCount + i) * 4;
      data[idx] = x1 + (x2 - x1) * t;
      data[idx + 1] = y1 + (y2 - y1) * t;
      data[idx + 2] = z1 + (z2 - z1) * t;
      data[idx + 3] = 1.0; // edge weight
    }
  } else {
    for (let i = 0; i < edgeCount; i++) {
      sampler.sample(tempPos, tempNormal);
      const idx = (surfaceCount + i) * 4;
      data[idx] = tempPos.x;
      data[idx + 1] = tempPos.y;
      data[idx + 2] = tempPos.z;
      data[idx + 3] = 0.8;
    }
  }

  return data;
}

/**
 * Creates a DataTexture from sampled Float32Array for GPGPU simulation.
 */
export function createDataTexture(points: Float32Array, width: number, height: number): THREE.DataTexture {
  const texture = new THREE.DataTexture(
    points,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.needsUpdate = true;
  return texture;
}

/**
 * Loads a GLB model and extracts merged geometry from all its meshes.
 */
export async function loadGlbGeometry(url: string): Promise<THREE.BufferGeometry> {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const geometries: THREE.BufferGeometry[] = [];
        gltf.scene.updateMatrixWorld(true);
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            const clonedGeo = m.geometry.clone();
            clonedGeo.applyMatrix4(m.matrixWorld);
            geometries.push(clonedGeo);
          }
        });

        if (geometries.length === 0) {
          reject(new Error(`No meshes found in GLB at ${url}`));
          return;
        }

        const merged = mergeGeometries(geometries);
        resolve(normalizeGeometry(merged));
      },
      undefined,
      (err) => reject(err)
    );
  });
}

/**
 * Builds all 13 event forms + human base form into GPGPU textures.
 */
export async function buildAllFormTextures(
  count: number,
  texWidth: number,
  texHeight: number,
  humanModelPath: string
): Promise<Map<string, SampledFormData>> {
  const formMap = new Map<string, SampledFormData>();

  // 1. Human form
  let humanGeo: THREE.BufferGeometry;
  try {
    humanGeo = await loadGlbGeometry(humanModelPath);
  } catch (e) {
    console.warn('Could not load human GLB, using procedural anatomical mesh:', e);
    humanGeo = createHumanGeometry();
  }

  // Pre-generate geometries
  const geometryFactories: Record<string, () => THREE.BufferGeometry> = {
    human: () => humanGeo,
    exosuit: createExosuitGeometry,
    console: createConsoleGeometry,
    submarine: createSubmarineGeometry,
    drone: createDroneGeometry,
    rocket: createRocketGeometry,
    'circuit-chip': createCircuitChipGeometry,
    lightbulb: createLightBulbGeometry,
    boat: createBoatGeometry,
    'robotic-arm': createRoboticArmGeometry,
    jet: createJetGeometry,
    gear: createGearGeometry,
    'neural-core': createNeuralCoreGeometry,
    'suspension-bridge': createSuspensionBridgeGeometry,
  };

  for (const [id, factory] of Object.entries(geometryFactories)) {
    const geo = factory();
    const points = sampleGeometry(geo, count);
    const texture = createDataTexture(points, texWidth, texHeight);
    formMap.set(id, { id, texture, points });
  }

  return formMap;
}
