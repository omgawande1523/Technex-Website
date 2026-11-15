import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/**
 * Turns a loaded model into a cloud of glowing particles sampled over its surfaces.
 * The solid meshes under `root` are hidden and a THREE.Points is added to `root`,
 * so the particles follow any animation applied to `root` or its parents.
 */
export interface ParticleForm {
  points: THREE.Points;
  /** 0 = scattered away / invisible, 1 = fully formed. Forms bottom-to-top. */
  setReveal: (v: number) => void;
  update: (time: number) => void;
  dispose: () => void;
}

// Warm white, gold and a little pale blue, matching the background stardust
const PALETTE = [
  { color: new THREE.Color(1.0, 0.95, 0.86), weight: 0.6 },
  { color: new THREE.Color(1.0, 0.8, 0.5), weight: 0.25 },
  { color: new THREE.Color(0.72, 0.9, 1.0), weight: 0.15 },
];

function pickColor(): THREE.Color {
  let r = Math.random();
  for (const p of PALETTE) {
    if ((r -= p.weight) <= 0) return p.color;
  }
  return PALETTE[0].color;
}

function triangleArea(geom: THREE.BufferGeometry): number {
  const pos = geom.attributes.position;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  let area = 0;
  for (let i = 0; i + 2 < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    area += b.sub(a).cross(c.sub(a)).length() * 0.5;
  }
  return area;
}

export function buildParticleForm(
  root: THREE.Object3D,
  count: number,
  pixelRatio: number,
  /** Lower for models whose surfaces overlap a lot on screen, so they don't blow out */
  brightness = 1,
): ParticleForm {
  root.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();

  // Every solid mesh, baked into root-local space (position only)
  const parts: { geom: THREE.BufferGeometry; area: number }[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry?.attributes.position) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', mesh.geometry.attributes.position.clone());
    if (mesh.geometry.index) g.setIndex(mesh.geometry.index.clone());
    const flat = g.index ? g.toNonIndexed() : g;
    flat.applyMatrix4(new THREE.Matrix4().multiplyMatrices(rootInv, mesh.matrixWorld));
    const area = triangleArea(flat);
    if (area > 0) parts.push({ geom: flat, area });
    mesh.visible = false;
  });

  const totalArea = parts.reduce((s, p) => s + p.area, 0) || 1;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  let k = 0;
  parts.forEach((part, idx) => {
    const n = idx === parts.length - 1 ? count - k : Math.round((part.area / totalArea) * count);
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(part.geom)).build();
    for (let i = 0; i < n && k < count; i++, k++) {
      sampler.sample(p);
      positions.set([p.x, p.y, p.z], k * 3);
      const c = pickColor();
      colors.set([c.r, c.g, c.b], k * 3);
    }
    part.geom.dispose();
  });

  return buildParticleCloud(root, positions, colors, k, pixelRatio, brightness);
}

/**
 * Shared particle renderer: twinkling additive points that scatter away / gather in
 * bottom-to-top via setReveal. Points are added as a child of `root`.
 */
export function buildParticleCloud(
  root: THREE.Object3D,
  positions: Float32Array,
  colors: Float32Array,
  k: number,
  pixelRatio: number,
  brightness = 1,
  sizeScale = 1,
): ParticleForm {
  const count = positions.length / 3;
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let i = 0; i < k; i++) {
    sizes[i] = (Math.random() < 0.9 ? 1.3 + Math.random() * 1.5 : 3.0 + Math.random() * 2.0) * sizeScale;
    phases[i] = Math.random() * Math.PI * 2;
  }

  // Normalised height (0 = bottom, 1 = top) drives the bottom-to-top reveal
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < k; i++) {
    const y = positions[i * 3 + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const rangeY = Math.max(1e-6, maxY - minY);
  const heights = new Float32Array(count);
  for (let i = 0; i < k; i++) heights[i] = (positions[i * 3 + 1] - minY) / rangeY;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geom.setAttribute('aHeight', new THREE.BufferAttribute(heights, 1));
  geom.setDrawRange(0, k);

  const uniforms = {
    uTime: { value: 0 },
    uReveal: { value: 1 },
    uPixelRatio: { value: pixelRatio },
    uBrightness: { value: brightness },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      attribute float aHeight;
      uniform float uTime;
      uniform float uReveal;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        // 1 when this particle is in place, 0 when scattered away
        float formed = smoothstep(aHeight, aHeight + 0.15, uReveal * 1.15);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        // Gentle shimmer while formed; drift up and outward while scattering
        vec3 dir = normalize(vec3(sin(aPhase * 7.1), 0.6 + 0.4 * cos(aPhase * 3.3), sin(aPhase * 5.3)));
        mv.xyz += vec3(sin(uTime * 0.9 + aPhase), cos(uTime * 0.7 + aPhase * 1.3), 0.0) * 0.006;
        mv.xyz += dir * (1.0 - formed) * 0.6;
        gl_Position = projectionMatrix * mv;
        float twinkle = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uTime * (1.2 + fract(aPhase * 3.7) * 2.6) + aPhase), 3.0);
        vAlpha = twinkle * formed;
        vColor = aColor;
        gl_PointSize = aSize * uPixelRatio * (0.85 + 0.3 * twinkle);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uBrightness;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float core = pow(smoothstep(0.5, 0.0, d), 1.8);
        gl_FragColor = vec4(vColor * core * 1.35, core * vAlpha * uBrightness);
      }
    `,
  });

  const points = new THREE.Points(geom, material);
  points.frustumCulled = false;
  points.renderOrder = 2;
  root.add(points);

  return {
    points,
    setReveal: (v: number) => {
      uniforms.uReveal.value = v;
      points.visible = v > 0.001;
    },
    update: (time: number) => {
      uniforms.uTime.value = time;
    },
    dispose: () => {
      geom.dispose();
      material.dispose();
    },
  };
}
