"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */

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

const screenFrag = /* glsl */ `
uniform sampler2D map;
uniform vec2 uRepeat;
uniform vec2 uOffset;
uniform float uTime;
uniform float uHover;
uniform float uSeed;
varying vec2 vUv;
float rand(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 uv = vUv * uRepeat + uOffset;
  // slight CRT barrel
  vec2 cc = vUv - 0.5;
  uv += cc * dot(cc, cc) * 0.04 * uRepeat;
  vec3 col = texture2D(map, uv).rgb;
  float scan = 0.9 + 0.1 * sin(vUv.y * 900.0 + uTime * 6.0);
  float n = rand(vUv * 400.0 + floor(uTime * 24.0) + uSeed) * 0.08;
  col = col * scan + n;
  col *= mix(0.55, 1.15, uHover);
  float vig = smoothstep(0.85, 0.35, length(cc));
  col *= mix(0.6, 1.0, vig);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const screenVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

function Screen({ item, tex, pos, rotY, seed }: { item: ScreenItem; tex: THREE.Texture; pos: THREE.Vector3; rotY: number; seed: number }) {
  const { scene } = useGLTF(SCREEN_URL);
  const router = useRouter();
  const group = useRef<THREE.Group>(null);
  const hover = useRef(0);
  const hovered = useRef(false);

  const { model, uniforms } = useMemo(() => {
    const model = scene.clone(true);
    cover(tex);
    const uniforms = {
      map: { value: tex },
      uRepeat: { value: tex.repeat.clone() },
      uOffset: { value: tex.offset.clone() },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uSeed: { value: seed },
    };
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (o.name.startsWith("Screen_Surface")) {
        m.material = new THREE.ShaderMaterial({ uniforms, vertexShader: screenVert, fragmentShader: screenFrag, toneMapped: false });
      } else {
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.envMapIntensity = 2;
        m.material = mat;
      }
    });
    return { model, uniforms };
  }, [scene, tex, seed]);

  useFrame((s, dt) => {
    const g = group.current;
    if (!g) return;
    const t = s.clock.elapsedTime;
    uniforms.uTime.value = t;
    hover.current = THREE.MathUtils.damp(hover.current, hovered.current ? 1 : 0, 6, dt);
    uniforms.uHover.value = hover.current;
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
