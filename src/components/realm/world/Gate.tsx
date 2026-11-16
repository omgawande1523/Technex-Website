"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { realm, near, clamp } from "../store";
import { PORTAL } from "./layout";

export const PORTAL_URL = "/realm/models/portal.glb";
export const LETTERS_URL = "/realm/models/letters.glb";

const membraneVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const membraneFrag = /* glsl */ `
uniform float uTime;
uniform float uOpen;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float ang = atan(p.y, p.x);
  // swirling ink, pulled towards the centre
  float swirl = ang + r * 3.2 - uTime * 0.35;
  vec2 q = vec2(cos(swirl), sin(swirl)) * r * 2.4;
  float ink = fbm(q * 1.6 + uTime * 0.08);
  float veins = smoothstep(0.52, 0.56, ink) - smoothstep(0.56, 0.62, ink);
  vec3 gold = vec3(1.0, 0.72, 0.32);
  vec3 deep = vec3(0.035, 0.02, 0.06);
  vec3 col = mix(deep, vec3(0.18, 0.08, 0.28), smoothstep(0.2, 0.9, ink));
  col += gold * veins * (1.2 + uOpen * 2.0);
  // bright core that opens as the camera approaches
  float core = smoothstep(0.9, 0.0, r) * (0.15 + uOpen * 1.6);
  col += gold * core * core;
  float rim = smoothstep(0.82, 1.0, r);
  col += gold * rim * 1.4;
  float alpha = smoothstep(1.0, 0.96, r) * (0.92 + 0.08 * uOpen);
  gl_FragColor = vec4(col, alpha);
}`;

function Membrane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpen: { value: 0 } }), []);
  useFrame((s) => {
    if (!mat.current) return;
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uOpen.value = clamp(realm.progress / 0.7);
  });
  return (
    <mesh position={[0, PORTAL.centerY, 0.02]} renderOrder={2}>
      <circleGeometry args={[PORTAL.innerR, 128]} />
      <shaderMaterial
        ref={mat}
        vertexShader={membraneVert}
        fragmentShader={membraneFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function Letters() {
  const { scene } = useGLTF(LETTERS_URL);
  const group = useRef<THREE.Group>(null);
  const letters = useMemo(() => {
    const out: { o: THREE.Object3D; x: number; seed: number }[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.envMapIntensity = 2.2;
        mat.roughness = 0.16;
      }
      if (o.name.startsWith("Letter_")) out.push({ o, x: o.position.x, seed: out.length * 1.7 });
    });
    return out;
  }, [scene]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const vis = 1 - clamp(realm.progress / 0.55);
    g.visible = vis > 0.01;
    // letters drift apart and tumble as you leave the gate
    const spread = 1 - vis;
    for (const l of letters) {
      l.o.position.y = Math.sin(t * 0.8 + l.seed) * 0.06 + spread * (1.5 + Math.sin(l.seed) * 1.2);
      l.o.position.x = l.x * (1 + spread * 0.5);
      l.o.rotation.x = Math.sin(t * 0.5 + l.seed) * 0.05 + spread * (l.seed % 2 ? 1 : -1) * 1.2;
      l.o.rotation.y = Math.sin(t * 0.4 + l.seed * 2) * 0.08 + realm.pointer.x * 0.12;
    }
  });

  return (
    <group ref={group} position={[0, 9.3, -0.6]} scale={1.65}>
      <primitive object={scene} />
    </group>
  );
}

export default function Gate() {
  const { scene } = useGLTF(PORTAL_URL);
  const ring = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (!mat) return;
      mat.envMapIntensity = mat.metalness > 0.5 ? 2.4 : 0.9;
    });
  }, [scene]);

  useFrame(() => {
    if (ring.current) ring.current.visible = realm.progress < 1.35;
  });

  const floorVisible = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (floorVisible.current) floorVisible.current.visible = realm.progress < 1.2;
  });

  return (
    <group ref={ring}>
      <primitive object={scene} />
      <Membrane />
      <Letters />
      {/* dark mirror floor */}
      <mesh ref={floorVisible} rotation-x={-Math.PI / 2} position={[0, 0.001, 4]} receiveShadow>
        <planeGeometry args={[90, 50]} />
        {realm.quality > 0 ? (
          <MeshReflectorMaterial
            blur={[400, 120]}
            resolution={1024}
            mixBlur={1}
            mixStrength={28}
            roughness={0.85}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#0a0908"
            metalness={0.6}
            mirror={0.7}
          />
        ) : (
          <meshStandardMaterial color="#0a0908" roughness={0.5} metalness={0.5} />
        )}
      </mesh>
      <GoldGrid />
      {/* gate lighting */}
      <spotLight position={[0, 14, 9]} angle={0.55} penumbra={0.9} intensity={160} distance={40} color="#ffd59a" castShadow />
      <pointLight position={[0, PORTAL.centerY, -1.5]} intensity={near(0, 0) * 30} distance={14} color="#ffb24d" />
    </group>
  );
}

/** Thin gold lines radiating on the floor, fading into the fog. */
function GoldGrid() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      pts.push(Math.cos(a) * 5.4, 0.01, Math.sin(a) * 5.4, Math.cos(a) * 40, 0.01, Math.sin(a) * 40);
    }
    for (const r of [6.5, 9, 13, 19, 27]) {
      for (let i = 0; i < 128; i++) {
        const a0 = (i / 128) * Math.PI * 2;
        const a1 = ((i + 1) / 128) * Math.PI * 2;
        pts.push(Math.cos(a0) * r, 0.01, Math.sin(a0) * r, Math.cos(a1) * r, 0.01, Math.sin(a1) * r);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#d9ad62" transparent opacity={0.22} toneMapped={false} />
    </lineSegments>
  );
}

useGLTF.preload(PORTAL_URL);
useGLTF.preload(LETTERS_URL);
