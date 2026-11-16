"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import { realm, near } from "../store";
import { SPOTS } from "./layout";

export const ROCKS_URL = "/realm/models/rocks.glb";

/** Canvas texture of repeated text, gold on transparent. */
export function useTextTexture(text: string, opts: { height?: number; font?: string; stroke?: boolean; repeat?: number } = {}) {
  return useMemo(() => {
    const h = opts.height ?? 256;
    const font = opts.font ?? `900 ${Math.round(h * 0.72)}px "Barge Realm", "Arial Black", sans-serif`;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width);
    c.width = Math.min(8192, w);
    c.height = h;
    ctx.font = font;
    ctx.textBaseline = "middle";
    if (opts.stroke) {
      ctx.strokeStyle = "#d9ad62";
      ctx.lineWidth = Math.max(2, h * 0.012);
      ctx.strokeText(text, 0, h / 2);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#fff1c9");
      grad.addColorStop(0.5, "#e7b45c");
      grad.addColorStop(1, "#8a5a1c");
      ctx.fillStyle = grad;
      ctx.fillText(text, 0, h / 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.repeat.x = opts.repeat ?? 1;
    return tex;
  }, [text, opts.height, opts.font, opts.stroke, opts.repeat]);
}

function TypeRing({ text, radius, y, speed, tilt, height }: { text: string; radius: number; y: number; speed: number; tilt: number; height: number }) {
  const tex = useTextTexture(text, { repeat: 3 });
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    tex.offset.x = (tex.offset.x + dt * speed * (1 + Math.abs(realm.velocity) * 2)) % 1;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = near(realm.progress, 1, 0.85);
    ref.current.visible = m.opacity > 0.01;
  });
  return (
    <mesh ref={ref} position={[SPOTS.realm.x, SPOTS.realm.y + y, SPOTS.realm.z]} rotation={[tilt, 0, tilt * 0.6]}>
      <cylinderGeometry args={[radius, radius, height, 160, 1, true]} />
      <meshBasicMaterial map={tex} transparent side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function TextWall() {
  const tex = useTextTexture("INKARNATE • IMAGINATION MEETS REALITY • ", { height: 512, stroke: true, repeat: 1.4 });
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    tex.offset.x = (tex.offset.x + dt * 0.02) % 1;
    const m = ref.current.material as THREE.MeshBasicMaterial;
    m.opacity = near(realm.progress, 1, 0.9) * 0.28;
    ref.current.visible = m.opacity > 0.01;
  });
  return (
    <mesh ref={ref} position={[0, 7, -56]}>
      <planeGeometry args={[72, 12]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

/** Floating CC0 rocks (Poly Haven) scattered through the realm. */
function Rocks() {
  const { nodes } = useGLTF(ROCKS_URL);
  const rocks = useMemo(
    () => Object.values(nodes).filter((n): n is THREE.Mesh => (n as THREE.Mesh).isMesh && n.name.startsWith("Rock_")),
    [nodes],
  );
  const placements = useMemo(() => {
    const rnd = (() => {
      let s = 7;
      return () => ((s = (s * 16807) % 2147483647) / 2147483647);
    })();
    const out: { pos: [number, number, number]; scale: number; rot: [number, number, number]; i: number; speed: number }[] = [];
    // the island Inky stands on
    out.push({ pos: [SPOTS.realm.x, SPOTS.realm.y - 1.15, SPOTS.realm.z], scale: 1.6, rot: [0, 0.4, 0], i: 0, speed: 0.6 });
    out.push({ pos: [22, 0.95, -44.5], scale: 1.15, rot: [0, 1.2, 0], i: 3, speed: 0.5 });
    for (let k = 0; k < 34; k++) {
      const z = -10 - rnd() * 100;
      const side = rnd() > 0.5 ? 1 : -1;
      const x = side * (6 + rnd() * 18) + (z < -38 && z > -56 ? 12 : 0);
      out.push({
        pos: [x, -1 + rnd() * 14, z],
        scale: 0.3 + rnd() * 1.3,
        rot: [rnd() * 6, rnd() * 6, rnd() * 6],
        i: Math.floor(rnd() * 5),
        speed: 0.6 + rnd() * 1.6,
      });
    }
    return out;
  }, []);
  useMemo(() => {
    rocks.forEach((r) => {
      const m = r.material as THREE.MeshStandardMaterial;
      if (m && !m.userData.tinted) {
        m.color.multiplyScalar(0.42);
        m.envMapIntensity = 0.6;
        m.userData.tinted = true;
      }
    });
  }, [rocks]);
  if (!rocks.length) return null;
  return (
    <group>
      {placements.map((p, k) => {
        const r = rocks[p.i % rocks.length];
        return (
          <Float key={k} speed={p.speed} rotationIntensity={k < 2 ? 0.05 : 0.5} floatIntensity={k < 2 ? 0.25 : 1.2}>
            <mesh geometry={r.geometry} material={r.material} position={p.pos} rotation={p.rot} scale={p.scale} castShadow receiveShadow />
          </Float>
        );
      })}
    </group>
  );
}

export default function Realm() {
  return (
    <group>
      <Rocks />
      <TypeRing text="INKARNATE • TECHNEX 26 • " radius={3.4} y={0.15} speed={0.03} tilt={0.14} height={0.42} />
      <TypeRing text="IMAGINATION MEETS REALITY • " radius={4.6} y={-0.55} speed={-0.02} tilt={-0.12} height={0.3} />
      <TextWall />
      <pointLight position={[SPOTS.realm.x + 3, SPOTS.realm.y + 4, SPOTS.realm.z + 4]} intensity={60} distance={22} color="#ffcf8a" />
      <pointLight position={[SPOTS.realm.x - 5, SPOTS.realm.y + 1, SPOTS.realm.z - 3]} intensity={40} distance={18} color="#8a5cff" />
    </group>
  );
}

useGLTF.preload(ROCKS_URL);
