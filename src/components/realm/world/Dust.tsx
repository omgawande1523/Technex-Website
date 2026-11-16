"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { realm } from "../store";

const vert = /* glsl */ `
uniform float uTime;
uniform float uPixel;
attribute float aSeed;
varying float vTw;
void main() {
  vec3 p = position;
  p.y += sin(uTime * 0.3 + aSeed * 6.28) * 0.35;
  p.x += cos(uTime * 0.2 + aSeed * 3.1) * 0.25;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vTw = 0.45 + 0.55 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 40.0);
  gl_PointSize = uPixel * (0.6 + aSeed * 1.4) * (26.0 / -mv.z);
}`;

const frag = /* glsl */ `
varying float vTw;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(1.0, 0.78, 0.42) * 1.6, a * vTw * 0.85);
}`;

/** Gold dust drifting through the whole world. */
export default function Dust() {
  const count = realm.quality === 0 ? 900 : 2600;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    let st = 2026;
    const rand = () => ((st = (st * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -30 + rand() * 70;
      pos[i * 3 + 1] = rand() * 16;
      pos[i * 3 + 2] = 22 - rand() * 145;
      seed[i] = rand();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixel: { value: 1 } }), []);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => {
    uniforms.uTime.value = s.clock.elapsedTime;
    uniforms.uPixel.value = s.gl.getPixelRatio();
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
