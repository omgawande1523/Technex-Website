"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { realm, along, near } from "../store";
import { heroPosition } from "./layout";

export const BUST_URL = "/realm/models/bust.glb";

/**
 * The hero: a classical bust (Poly Haven, CC0) that begins as a gold hologram —
 * imagination — and materialises into marble as you step through the portal —
 * reality. Afterwards it is re-cast per chapter: obsidian, gilded marble, gold.
 */
const LOOKS = [
  { color: "#ffffff", metalness: 0.0, roughness: 0.42, clearcoat: 0.25, env: 1.0, mapMix: 1 }, // 0 (hidden: hologram)
  { color: "#f3ece2", metalness: 0.0, roughness: 0.38, clearcoat: 0.35, env: 1.1, mapMix: 1 }, // 1 marble
  { color: "#141416", metalness: 0.3, roughness: 0.06, clearcoat: 1.0, env: 2.2, mapMix: 0 }, // 2 obsidian
  { color: "#ffc76a", metalness: 1.0, roughness: 0.16, clearcoat: 0.4, env: 1.8, mapMix: 1 }, // 3 gilded marble
  { color: "#ffcf80", metalness: 1.0, roughness: 0.1, clearcoat: 0.6, env: 2.0, mapMix: 0.4 }, // 4 gold
].map((l) => ({ ...l, c: new THREE.Color(l.color) }));

const holoVert = /* glsl */ `
varying vec3 vN;
varying vec3 vView;
varying float vY;
void main() {
  vY = position.y;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const holoFrag = /* glsl */ `
uniform float uTime;
uniform float uReveal;
uniform float uFade;
uniform float uMinY;
uniform float uMaxY;
varying vec3 vN;
varying vec3 vView;
varying float vY;
void main() {
  if (vY < uReveal) discard;
  float h = (vY - uMinY) / (uMaxY - uMinY);
  float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.2);
  float scan = 0.55 + 0.45 * sin(h * 220.0 - uTime * 3.0);
  float band = smoothstep(0.04, 0.0, abs(h - fract(uTime * 0.18)));
  vec3 gold = vec3(1.0, 0.74, 0.36);
  vec3 col = gold * (0.12 + fres * 1.6) * scan + gold * band * 0.8;
  // the materialising edge
  float edge = smoothstep(0.05, 0.0, (vY - uReveal) / (uMaxY - uMinY));
  col += vec3(1.0, 0.9, 0.7) * edge * 3.0;
  float a = (0.18 + fres * 0.85 + band * 0.4 + edge) * uFade;
  gl_FragColor = vec4(col, a);
}`;

const tmpColor = new THREE.Color();
const tmpV = new THREE.Vector3();

export default function Hero() {
  const { scene } = useGLTF(BUST_URL);

  const { solid, holo, wire, uniforms, minY, maxY, solidMat } = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !mesh) mesh = o as THREE.Mesh;
    });
    const src = mesh as unknown as THREE.Mesh;
    const geo = src.geometry;
    geo.computeBoundingBox();
    const minY = geo.boundingBox!.min.y;
    const maxY = geo.boundingBox!.max.y;
    const srcMat = src.material as THREE.MeshStandardMaterial;

    const uniforms = {
      uTime: { value: 0 },
      uReveal: { value: maxY + 1 },
      uFade: { value: 1 },
      uMinY: { value: minY },
      uMaxY: { value: maxY },
    };

    const solidMat = new THREE.MeshPhysicalMaterial({
      map: srcMat.map ?? null,
      normalMap: srcMat.normalMap ?? null,
      roughnessMap: srcMat.roughnessMap ?? null,
      color: new THREE.Color("#f3ece2"),
      roughness: 0.38,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.1,
    });
    solidMat.onBeforeCompile = (shader) => {
      shader.uniforms.uReveal = uniforms.uReveal;
      shader.uniforms.uMinY = uniforms.uMinY;
      shader.uniforms.uMaxY = uniforms.uMaxY;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vHeroY;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHeroY = position.y;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vHeroY;\nuniform float uReveal;\nuniform float uMinY;\nuniform float uMaxY;")
        .replace("void main() {", "void main() {\n  if (vHeroY > uReveal) discard;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\n  float heroEdge = smoothstep(0.035, 0.0, (uReveal - vHeroY) / (uMaxY - uMinY));\n  totalEmissiveRadiance += vec3(1.0, 0.78, 0.45) * heroEdge * 4.0;",
        );
    };

    const holoMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: holoVert,
      fragmentShader: holoFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const wireMat = new THREE.MeshBasicMaterial({ color: "#ffcf86", wireframe: true, transparent: true, opacity: 0.08, toneMapped: false, depthWrite: false });
    wireMat.onBeforeCompile = (shader) => {
      shader.uniforms.uReveal = uniforms.uReveal;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vHeroY;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHeroY = position.y;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vHeroY;\nuniform float uReveal;")
        .replace("void main() {", "void main() {\n  if (vHeroY < uReveal) discard;");
    };

    const make = (m: THREE.Material) => {
      const x = new THREE.Mesh(geo, m);
      x.position.copy(src.position);
      x.quaternion.copy(src.quaternion);
      x.scale.copy(src.scale);
      return x;
    };
    const solid = make(solidMat);
    solid.castShadow = true;
    const holo = make(holoMat);
    holo.renderOrder = 3;
    const wire = make(wireMat);
    wire.renderOrder = 4;
    return { solid, holo, wire, uniforms, minY, maxY, solidMat };
  }, [scene]);

  useEffect(() => () => solidMat.dispose(), [solidMat]);

  const root = useRef<THREE.Group>(null);
  const yaw = useRef(0);

  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    const p = realm.progress;
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;

    // imagination → reality: materialise bottom-up between the gate and the realm
    const r = along(p, [
      [0, 0],
      [0.3, 0],
      [0.95, 1],
    ]);
    uniforms.uReveal.value = minY + (maxY - minY + 0.02) * r - 0.01;
    uniforms.uFade.value = 1 - r * 0.85;
    holo.visible = r < 0.999;
    wire.visible = r < 0.999;

    // per-chapter look
    const i = Math.min(LOOKS.length - 2, Math.floor(p));
    const f = THREE.MathUtils.smoothstep(p - i, 0, 1);
    const a = LOOKS[i];
    const b = LOOKS[i + 1];
    tmpColor.copy(a.c).lerp(b.c, f);
    solidMat.color.copy(tmpColor);
    solidMat.metalness = THREE.MathUtils.lerp(a.metalness, b.metalness, f);
    solidMat.roughness = THREE.MathUtils.lerp(a.roughness, b.roughness, f);
    solidMat.clearcoat = THREE.MathUtils.lerp(a.clearcoat, b.clearcoat, f);
    solidMat.envMapIntensity = THREE.MathUtils.lerp(a.env, b.env, f);

    // glide along the path, one slow turn while travelling
    heroPosition(p, tmpV);
    tmpV.y += Math.sin(t * 0.9) * 0.08;
    g.position.copy(tmpV);
    const frac = p - Math.floor(p);
    const s = 1 - near(p, 4, 0.8) * 0.42;
    g.scale.setScalar(s);
    const target =
      Math.atan2(state.camera.position.x - g.position.x, state.camera.position.z - g.position.z) +
      realm.pointer.x * 0.4 +
      Math.sin(t * 0.25) * 0.12 +
      (Math.floor(p) + THREE.MathUtils.smootherstep(frac, 0, 1)) * Math.PI * 2;
    yaw.current = THREE.MathUtils.damp(yaw.current, target, 3.5, dt);
    g.rotation.set(-realm.pointer.y * 0.08, yaw.current, 0);
  });

  return (
    <group ref={root}>
      <primitive object={solid} />
      <primitive object={holo} />
      <primitive object={wire} />
      <spotLight position={[2.5, 4, 4]} angle={0.6} penumbra={1} intensity={60} distance={14} color="#ffe2b0" />
      <pointLight position={[-3, 1, -2]} intensity={14} distance={9} color="#8f7bff" />
    </group>
  );
}

useGLTF.preload(BUST_URL);
