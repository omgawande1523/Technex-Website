"use client";

 

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { realm, near, setUi } from "../store";
import { SPOTS } from "./layout";

export const SCREEN_URL = "/realm/models/screen.glb";

export interface ScreenItem {
  key: string;
  title: string;
  image: string;
  href: string;
}

const SCREEN_ASPECT = 3 / 2;

/** Fit a texture like CSS object-fit: cover on a 3:2 screen. */
function cover(tex: THREE.Texture) {
  const img = tex.image as { width: number; height: number } | undefined;
  if (!img?.width) return tex;
  const aspect = img.width / img.height;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (aspect > SCREEN_ASPECT) {
    tex.repeat.set(SCREEN_ASPECT / aspect, 1);
    tex.offset.set((1 - tex.repeat.x) / 2, 0);
  } else {
    tex.repeat.set(1, aspect / SCREEN_ASPECT);
    tex.offset.set(0, (1 - tex.repeat.y) / 2);
  }
  return tex;
}

function Screen({ item, tex, pos, rotY, seed }: { item: ScreenItem; tex: THREE.Texture; pos: THREE.Vector3; rotY: number; seed: number }) {
  const { scene } = useGLTF(SCREEN_URL);
  const router = useRouter();
  const group = useRef<THREE.Group>(null);
  const hover = useRef(0);
  const hovered = useRef(false);

  const { model, surface } = useMemo(() => {
    const model = scene.clone(true);
    cover(tex);
    const surface = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.7, 0.7, 0.7) });
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (o.name.startsWith("Screen_Surface")) {
        // the optimiser drops UVs on untextured meshes: rebuild 0..1 from the quad's bounds
        const g = m.geometry.clone();
        g.computeBoundingBox();
        const bb = g.boundingBox!;
        const pos = g.attributes.position;
        const uv = new Float32Array(pos.count * 2);
        const w = bb.max.x - bb.min.x || 1;
        const h = bb.max.y - bb.min.y || 1;
        for (let k = 0; k < pos.count; k++) {
          uv[k * 2] = (pos.getX(k) - bb.min.x) / w;
          uv[k * 2 + 1] = (pos.getY(k) - bb.min.y) / h;
        }
        g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
        m.geometry = g;
        m.material = surface;
        m.renderOrder = 1;
      } else {
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.envMapIntensity = 2;
        m.material = mat;
      }
    });
    return { model, surface };
  }, [scene, tex]);

  useFrame((s, dt) => {
    const g = group.current;
    if (!g) return;
    const t = s.clock.elapsedTime;
    hover.current = THREE.MathUtils.damp(hover.current, hovered.current ? 1 : 0, 6, dt);
    surface.color.setScalar(0.72 + hover.current * 0.45 + Math.sin(t * 7 + seed) * 0.015);
    const show = near(realm.progress, 2, 1.0);
    g.visible = show > 0.01;
    g.position.set(pos.x, pos.y + Math.sin(t * 0.6 + seed) * 0.12 - (1 - show) * 3, pos.z);
    g.rotation.y = rotY + Math.sin(t * 0.35 + seed) * 0.03 + hover.current * 0.08;
    const sc = 0.92 + hover.current * 0.08;
    g.scale.setScalar(sc * show);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    setUi({ hovered: item.title });
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    hovered.current = false;
    setUi({ hovered: null });
    document.body.style.cursor = "";
  };

  return (
    <group
      ref={group}
      onPointerOver={over}
      onPointerOut={out}
      onClick={(e) => {
        e.stopPropagation();
        if (Math.abs(realm.progress - 2) < 0.2) router.push(item.href);
      }}
    >
      <primitive object={model} />
    </group>
  );
}

export default function Screens({ items }: { items: ScreenItem[] }) {
  const list = items.slice(0, realm.quality === 0 ? 7 : 12);
  const textures = useTexture(list.map((i) => i.image));
  const placements = useMemo(() => {
    const centre = new THREE.Vector3(SPOTS.events.x, SPOTS.events.y, SPOTS.events.z + 6);
    const n = list.length;
    const rows = n > 7 ? 2 : 1;
    const perRow = Math.ceil(n / rows);
    return list.map((_, k) => {
      const row = Math.floor(k / perRow);
      const col = k % perRow;
      const span = Math.PI * 0.95;
      const a = -span / 2 + (perRow === 1 ? 0.5 : col / (perRow - 1)) * span + (row ? span / perRow / 2 : 0);
      const r = 12 + row * 1.5;
      const pos = new THREE.Vector3(centre.x + Math.sin(a) * r, centre.y + (rows === 2 ? (row ? -1.4 : 2.0) : 0.4), centre.z - Math.cos(a) * r);
      return { pos, rotY: -a };
    });
  }, [list]);

  return (
    <group>
      {list.map((item, k) => (
        <Screen key={item.key} item={item} tex={textures[k]} pos={placements[k].pos} rotY={placements[k].rotY} seed={k * 1.37} />
      ))}
      <pointLight position={[SPOTS.events.x, SPOTS.events.y + 5, SPOTS.events.z + 8]} intensity={50} distance={26} color="#ffe0b0" />
    </group>
  );
}

useGLTF.preload(SCREEN_URL);
