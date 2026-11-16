"use client";

 
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { realm } from "../store";

const FONT = "/realm/fonts/Barge-Black.ttf";

/**
 * Tathva-style typography: during each chapter change a word appears far ahead
 * on the camera's line of sight and rushes towards (and past) the viewer.
 * Together they read: IMAGINATION · STEPS THROUGH · TURNING INTO · REALITY.
 */
const WORDS: { from: number; text: string; sub: string }[] = [
  { from: 0, text: "IMAGINATION", sub: "step through the gate" },
  { from: 1, text: "STEPS THROUGH", sub: "into the realm of events" },
  { from: 2, text: "TURNING INTO", sub: "skills, built by hand" },
  { from: 3, text: "REALITY", sub: "TECHNEX 26 · INKARNATE" },
];

const fwd = new THREE.Vector3();
const up = new THREE.Vector3();

function Word({ from, text, sub }: { from: number; text: string; sub: string }) {
  const group = useRef<THREE.Group>(null);
  const main = useRef<THREE.Mesh>(null);
  const small = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    const local = realm.progress - from; // 0 → 1 across this transition
    const active = local > 0.02 && local < 0.98;
    g.visible = active;
    if (!active) return;
    // ease: arrive fast, hang in the middle, then rush past
    const t = THREE.MathUtils.clamp((local - 0.04) / 0.92, 0, 1);
    const k = t < 0.5 ? 0.5 * Math.pow(t * 2, 0.6) : 0.5 + 0.5 * Math.pow((t - 0.5) * 2, 2.2);
    const dist = THREE.MathUtils.lerp(26, -1.5, k);
    camera.getWorldDirection(fwd);
    up.set(0, 1, 0).applyQuaternion(camera.quaternion);
    g.position.copy(camera.position).addScaledVector(fwd, dist).addScaledVector(up, 0.35);
    g.quaternion.copy(camera.quaternion);
    const fadeIn = THREE.MathUtils.smoothstep(t, 0.0, 0.18);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(dist, 5, 1.2) * 1;
    const o = fadeIn * Math.max(0, fadeOut);
    const m1 = main.current?.material as THREE.MeshBasicMaterial | undefined;
    const m2 = small.current?.material as THREE.MeshBasicMaterial | undefined;
    if (m1) m1.opacity = o;
    if (m2) m2.opacity = o * 0.8;
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1.6;
    g.scale.setScalar(Math.min(1, aspect / 1.55) * (1 + Math.max(0, 6 - dist) * 0.02));
  });

  return (
    <group ref={group} visible={false}>
      <Text
        ref={main}
        font={FONT}
        fontSize={2.6}
        letterSpacing={0.02}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#ffe9b8"
        outlineOpacity={0.6}
        renderOrder={10}
      >
        {text}
        <meshBasicMaterial color="#e8b862" transparent toneMapped={false} depthWrite={false} depthTest={false} />
      </Text>
      <Text ref={small} font={FONT} fontSize={0.32} letterSpacing={0.4} anchorX="center" anchorY="middle" position={[0, -1.9, 0]} renderOrder={10}>
        {sub.toUpperCase()}
        <meshBasicMaterial color="#f4ead8" transparent toneMapped={false} depthWrite={false} depthTest={false} />
      </Text>
    </group>
  );
}

export default function FlyWords() {
  return (
    <>
      {WORDS.map((w) => (
        <Word key={w.from} {...w} />
      ))}
    </>
  );
}
