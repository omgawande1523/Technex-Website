"use client";

 

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { realm, near } from "../store";
import { SPOTS } from "./layout";

/** The register chapter: the hero floats inside an iridescent glass bubble. */
export default function Bubble() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const m = ref.current;
    if (!m) return;
    const show = near(realm.progress, 4, 0.7);
    m.visible = show > 0.01;
    const t = s.clock.elapsedTime;
    const k = 2.1 * show;
    m.scale.set(k * (1 + Math.sin(t * 1.3) * 0.035), k * (1 + Math.sin(t * 1.7 + 1) * 0.04), k * (1 + Math.cos(t * 1.1) * 0.03));
    m.rotation.set(t * 0.07, t * 0.11, 0);
  });
  return (
    <group position={[SPOTS.register.x, SPOTS.register.y + 0.2, SPOTS.register.z]}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 24]} />
        {realm.quality > 0 ? (
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            thickness={0.35}
            roughness={0}
            transmission={1}
            ior={1.25}
            chromaticAberration={0.6}
            anisotropicBlur={0.2}
            distortion={0.45}
            distortionScale={0.4}
            temporalDistortion={0.12}
            iridescence={1}
            iridescenceIOR={1.4}
            iridescenceThicknessRange={[120, 900]}
            backside
            backsideThickness={0.2}
            color="#ffffff"
            envMapIntensity={2}
          />
        ) : (
          <meshPhysicalMaterial
            transparent
            opacity={0.35}
            roughness={0}
            metalness={0.2}
            iridescence={1}
            iridescenceIOR={1.4}
            color="#ffffff"
            envMapIntensity={2}
          />
        )}
      </mesh>
      <pointLight position={[2.5, 2.5, 3]} intensity={30} distance={12} color="#c9a2ff" />
      <pointLight position={[-2.5, -1, 2]} intensity={24} distance={12} color="#ffcc80" />
    </group>
  );
}
