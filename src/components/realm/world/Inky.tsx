"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { realm, near } from "../store";
import { inkyPosition } from "./layout";

export const INKY_URL = "/realm/models/inky.glb";

/** Inky's body look in each chapter; lerped every frame. */
const LOOKS = [
  { color: "#060607", metalness: 0.15, roughness: 0.16, clearcoat: 1, iridescence: 0.0, env: 1.4, sheen: 0.4 },
  { color: "#ffbe5c", metalness: 1.0, roughness: 0.1, clearcoat: 0.6, iridescence: 0.25, env: 1.6, sheen: 0 },
  { color: "#020203", metalness: 0.35, roughness: 0.04, clearcoat: 1, iridescence: 0.0, env: 2.0, sheen: 0 },
  { color: "#f2e6d0", metalness: 1.0, roughness: 0.06, clearcoat: 1, iridescence: 0.85, env: 1.8, sheen: 0 },
  { color: "#ffc76a", metalness: 1.0, roughness: 0.14, clearcoat: 0.5, iridescence: 0.4, env: 1.6, sheen: 0 },
].map((l) => ({ ...l, c: new THREE.Color(l.color) }));

const tmpColor = new THREE.Color();
const tmpV = new THREE.Vector3();
const lookAtV = new THREE.Vector3();

export default function Inky() {
  const { scene } = useGLTF(INKY_URL);
  const root = useRef<THREE.Group>(null);
  const model = useMemo(() => scene.clone(true), [scene]);

  const bodyMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: LOOKS[0].c.clone(),
        metalness: 0.15,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0,
        iridescenceIOR: 1.6,
        iridescenceThicknessRange: [200, 900],
        sheen: 0.4,
        sheenColor: new THREE.Color("#d9ad62"),
        sheenRoughness: 0.35,
        envMapIntensity: 1.4,
      }),
    [],
  );

  const parts = useMemo(() => {
    const byName: Record<string, THREE.Object3D> = {};
    model.traverse((o) => {
      byName[o.name] = o;
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      if (o.name.startsWith("Inky_Body") || o.name.startsWith("Inky_Foot")) mesh.material = bodyMat;
      else {
        const m = mesh.material as THREE.MeshStandardMaterial;
        if (m && "envMapIntensity" in m) m.envMapIntensity = 2;
      }
    });
    return {
      eyes: [byName.Inky_EyeL, byName.Inky_EyeR, byName.Inky_ShineL, byName.Inky_ShineR].filter(Boolean),
      feet: [byName.Inky_FootL, byName.Inky_FootR, byName.Inky_AnkletL, byName.Inky_AnkletR].filter(Boolean),
      eyeBase: [byName.Inky_EyeL, byName.Inky_EyeR, byName.Inky_ShineL, byName.Inky_ShineR]
        .filter(Boolean)
        .map((o) => ({ o, x: o.position.x, y: o.position.y, sy: o.scale.y })),
      footBase: [byName.Inky_FootL, byName.Inky_FootR, byName.Inky_AnkletL, byName.Inky_AnkletR]
        .filter(Boolean)
        .map((o) => ({ o, y: o.position.y })),
    };
  }, [model, bodyMat]);

  useEffect(() => () => bodyMat.dispose(), [bodyMat]);

  const blink = useRef({ next: 2.5, t: -1 });
  const yaw = useRef(0);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const p = realm.progress;
    const t = state.clock.elapsedTime;

    // --- material: blend between the two nearest chapter looks
    const i = Math.min(LOOKS.length - 2, Math.floor(p));
    const f = THREE.MathUtils.smoothstep(p - i, 0, 1);
    const a = LOOKS[i];
    const b = LOOKS[i + 1];
    tmpColor.copy(a.c).lerp(b.c, f);
    bodyMat.color.copy(tmpColor);
    bodyMat.metalness = THREE.MathUtils.lerp(a.metalness, b.metalness, f);
    bodyMat.roughness = THREE.MathUtils.lerp(a.roughness, b.roughness, f);
    bodyMat.clearcoat = THREE.MathUtils.lerp(a.clearcoat, b.clearcoat, f);
    bodyMat.iridescence = THREE.MathUtils.lerp(a.iridescence, b.iridescence, f);
    bodyMat.envMapIntensity = THREE.MathUtils.lerp(a.env, b.env, f);
    bodyMat.sheen = THREE.MathUtils.lerp(a.sheen, b.sheen, f);

    // --- travel: follow the chapter path and hop between worlds
    inkyPosition(p, tmpV);
    const frac = p - Math.floor(p);
    const travelling = frac > 0.001 && frac < 0.999;
    const hop = travelling ? Math.sin(Math.PI * frac) * 2.4 : 0;
    tmpV.y += hop + Math.sin(t * 1.6) * 0.05 + (Math.floor(p) === 3 || p > 2.5 ? Math.sin(t * 1.1) * 0.15 : 0);
    g.position.copy(tmpV);

    // scale: smaller inside the register bubble
    const s = 0.78 - near(p, 4, 0.8) * 0.3;
    // squash & stretch: breathe at rest, stretch while hopping
    const breathe = Math.sin(t * 2.2) * 0.018;
    const stretch = travelling ? Math.sin(Math.PI * frac * 2) * 0.08 : 0;
    g.scale.set(s * (1 + breathe - stretch * 0.5), s * (1 - breathe + stretch), s * (1 + breathe - stretch * 0.5));

    // face the camera, with a little lean towards the pointer
    lookAtV.copy(state.camera.position);
    const target = Math.atan2(lookAtV.x - g.position.x, lookAtV.z - g.position.z) + realm.pointer.x * 0.35;
    yaw.current = THREE.MathUtils.damp(yaw.current, target, 4, dt);
    g.rotation.set(-realm.pointer.y * 0.12 + (travelling ? Math.sin(Math.PI * frac) * 0.25 : 0), yaw.current, 0);

    // eyes: look at the pointer and blink every few seconds
    const bl = blink.current;
    if (t > bl.next && bl.t < 0) bl.t = 0;
    let lid = 1;
    if (bl.t >= 0) {
      bl.t += dt;
      lid = 1 - Math.sin(Math.min(1, bl.t / 0.16) * Math.PI) * 0.92;
      if (bl.t > 0.16) {
        bl.t = -1;
        bl.next = t + 2.2 + Math.random() * 3.5;
      }
    }
    for (const e of parts.eyeBase) {
      e.o.scale.y = e.sy * lid;
      e.o.position.x = e.x + realm.pointer.x * 0.035;
      e.o.position.y = e.y + realm.pointer.y * 0.025;
    }
    // feet bob while travelling
    parts.footBase.forEach((ft, k) => {
      ft.o.position.y = ft.y + (travelling ? Math.sin(t * 14 + k * Math.PI) * 0.04 : 0);
    });
  });

  return (
    <group ref={root}>
      <primitive object={model} />
      <pointLight position={[0, 2.2, 2.4]} intensity={3} distance={8} color="#ffd9a0" />
    </group>
  );
}

useGLTF.preload(INKY_URL);
