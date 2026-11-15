"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The forms the hero hologram cycles through. Same models the previous
 * raw-three hero used (public/models, re-compressed with meshopt by
 * scripts/optimize-models.mjs).
 */
export const HOLOGRAM_FORMS = [
  { id: "humanoid", url: "/models/male_body-compressed.glb" },
  { id: "flying_machine", url: "/models/flying_machine-compressed.glb" },
  { id: "watercraft", url: "/models/paddle_boat-compressed.glb" },
  { id: "neural_network", url: "/models/artificial_neural_network_ann-compressed.glb" },
] as const;

const cache = new Map<string, Promise<Float32Array>>();
let loader: GLTFLoader | null = null;

function getLoader() {
  if (!loader) {
    loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
  return loader;
}

/**
 * Loads a GLB once and returns `count` points sampled on its surface,
 * centred and scaled to fit a 2.4-unit tall box. Cached per url+count.
 */
export function loadModelPoints(url: string, count: number, onProgress?: (f: number) => void) {
  const key = `${url}#${count}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Promise<Float32Array>((resolve, reject) => {
    getLoader().load(
      url,
      (gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const parts: THREE.BufferGeometry[] = [];
        gltf.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh || !mesh.geometry?.attributes.position) return;
          // Skip helper boxes/planes (e.g. a stray 24-vertex cube) that would dominate the sample.
          if (mesh.geometry.attributes.position.count <= 36) return;
          // Positions may be quantized (normalized int16, interleaved) by meshopt
          // optimisation; copy them out as plain floats before transforming, or
          // applyMatrix4 would clamp them back into the int16 range.
          const src = mesh.geometry.attributes.position;
          const floats = new Float32Array(src.count * 3);
          for (let i = 0; i < src.count; i++) {
            floats[i * 3] = src.getX(i);
            floats[i * 3 + 1] = src.getY(i);
            floats[i * 3 + 2] = src.getZ(i);
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.BufferAttribute(floats, 3));
          if (mesh.geometry.index) g.setIndex(mesh.geometry.index.clone());
          g.applyMatrix4(mesh.matrixWorld);
          parts.push(g.index ? g.toNonIndexed() : g);
        });
        if (!parts.length) return reject(new Error(`No meshes in ${url}`));
        const merged = mergeGeometries(parts, false);
        if (!merged) return reject(new Error(`Could not merge ${url}`));
        merged.computeBoundingBox();
        const box = merged.boundingBox!;
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const scale = 2.4 / Math.max(size.x, size.y, size.z);
        merged.translate(-center.x, -center.y, -center.z);
        merged.scale(scale, scale, scale);

        const sampler = new MeshSurfaceSampler(new THREE.Mesh(merged)).build();
        const out = new Float32Array(count * 3);
        const v = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
          sampler.sample(v);
          out.set([v.x, v.y, v.z], i * 3);
        }
        merged.dispose();
        parts.forEach((g) => g.dispose());
        onProgress?.(1);
        resolve(out);
      },
      (e) => {
        if (e.total) onProgress?.(e.loaded / e.total);
      },
      reject,
    );
  });
  cache.set(key, p);
  return p;
}

/** A soft sphere of points used before the first model arrives. */
export function seedCloud(count: number) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const r = 1.1 * Math.cbrt(Math.random());
    const s = Math.sqrt(1 - u * u);
    out.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
  }
  return out;
}
