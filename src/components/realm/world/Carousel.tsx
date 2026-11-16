"use client";

 

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { realm, near, setUi } from "../store";
import { SPOTS } from "./layout";
import type { ScreenItem } from "./Screens";

const R = 7.2;
const W = 3.6;
const H = 2.03;

/** A curved panel: a plane bent around the carousel radius. */
function useCurvedPlane() {
  return useMemo(() => {
    const g = new THREE.PlaneGeometry(W, H, 32, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const a = x / R;
      pos.setXYZ(i, Math.sin(a) * R, pos.getY(i), Math.cos(a) * R - R);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

export default function Carousel({ items }: { items: ScreenItem[] }) {
  // fill the ring: at least 9 panels
  const list = useMemo(() => {
    const out: ScreenItem[] = [];
    while (items.length && out.length < Math.max(9, items.length)) out.push(items[out.length % items.length]);
    return out;
  }, [items]);
  const textures = useTexture(list.map((i) => i.image));
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  const geo = useCurvedPlane();
  const ring = useRef<THREE.Group>(null);
  const router = useRouter();
  const spin = useRef(0);

  useFrame((s, dt) => {
    const g = ring.current;
    if (!g) return;
    const show = near(realm.progress, 3, 1.0);
    g.visible = show > 0.01;
    spin.current += dt * (0.12 + Math.abs(realm.velocity) * 0.8);
    g.rotation.y = spin.current + realm.pointer.x * 0.25;
    g.scale.setScalar(0.6 + show * 0.4);
    g.position.y = SPOTS.workshops.y + Math.sin(s.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={ring} position={[SPOTS.workshops.x, SPOTS.workshops.y, SPOTS.workshops.z]}>
      {list.map((item, k) => {
        const a = (k / list.length) * Math.PI * 2;
        return (
          <group key={k} rotation={[0, a, 0]}>
            <group position={[0, (k % 2 ? 0.55 : -0.55), R]}>
              <mesh
                geometry={geo}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setUi({ hovered: item.title });
                  document.body.style.cursor = "pointer";
                }}
                onPointerOut={() => {
                  setUi({ hovered: null });
                  document.body.style.cursor = "";
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (Math.abs(realm.progress - 3) < 0.2) router.push(item.href);
                }}
              >
                <meshBasicMaterial map={textures[k]} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
              {/* gold edge */}
              <mesh geometry={geo} position={[0, 0, -0.04]} scale={[1.03, 1.06, 1]}>
                <meshStandardMaterial color="#d9ad62" metalness={1} roughness={0.25} envMapIntensity={2} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        );
      })}
      <pointLight position={[0, 3, 0]} intensity={40} distance={16} color="#ffd18a" />
    </group>
  );
}
