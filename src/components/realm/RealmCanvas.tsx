"use client";

/* eslint-disable react-hooks/immutability -- three.js objects and uniforms are mutated inside useFrame (per frame, outside React render), which is how react-three-fiber is meant to be used. */

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { realm, clamp } from "./store";
import { cameraPosition, cameraTarget, skyColor } from "./world/layout";
import Inky from "./world/Inky";
import Gate from "./world/Gate";
import Realm from "./world/Realm";
import Screens, { type ScreenItem } from "./world/Screens";
import Carousel from "./world/Carousel";
import Bubble from "./world/Bubble";
import Dust from "./world/Dust";

const pos = new THREE.Vector3();
const look = new THREE.Vector3();
const diveFrom = new THREE.Vector3();
const sky = new THREE.Color();

/** Camera on the chapter path, with a dive-in after the intro and pointer parallax. */
function CameraRig() {
  const { camera, scene } = useThree();
  const smoothLook = useRef(new THREE.Vector3(0, 4.6, 0));
  const par = useRef({ x: 0, y: 0 });
  const last = useRef(0);
  useFrame((state, dt) => {
    const p = realm.progress;
    realm.velocity = THREE.MathUtils.damp(realm.velocity, (p - last.current) / Math.max(dt, 1e-3), 6, dt);
    last.current = p;

    cameraPosition(p, pos);
    cameraTarget(p, look);

    // dive: start high and far behind the gate, sweep down into position
    const d = realm.dive;
    if (d < 1) {
      const e = 1 - Math.pow(1 - d, 3);
      diveFrom.set(0, 16, 58);
      pos.lerpVectors(diveFrom, pos, e);
      look.y += (1 - e) * 4;
    }

    par.current.x = THREE.MathUtils.damp(par.current.x, realm.pointer.x, 2.5, dt);
    par.current.y = THREE.MathUtils.damp(par.current.y, realm.pointer.y, 2.5, dt);
    pos.x += par.current.x * 0.6;
    pos.y += par.current.y * 0.35;

    camera.position.copy(pos);
    smoothLook.current.lerp(look, 1 - Math.exp(-dt * 10));
    camera.lookAt(smoothLook.current);

    // per-chapter sky and fog
    skyColor(p, sky);
    (scene.background as THREE.Color).copy(sky);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(sky);
  });
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

/** Warm up: compile every material once so chapter changes never hitch. */
function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        gl.compile(scene, camera);
      } catch {
        /* non-fatal */
      }
    });
    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera]);
  return null;
}

export default function RealmCanvas({ events, workshops, onReady }: { events: ScreenItem[]; workshops: ScreenItem[]; onReady: () => void }) {
  const [dpr, setDpr] = useState<number>(1.5);
  const [fontReady, setFontReady] = useState(false);
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  if (mobile) realm.quality = 0;

  // the canvas text textures need the display face loaded first
  useEffect(() => {
    const face = new FontFace("Barge Realm", "url(/realm/fonts/Barge-Black.ttf)", { weight: "900" });
    face
      .load()
      .then((f) => document.fonts.add(f))
      .catch(() => {})
      .finally(() => setFontReady(true));
  }, []);

  return (
    <Canvas
      dpr={dpr}
      shadows={!mobile}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false, stencil: false }}
      camera={{ fov: mobile ? 58 : 42, near: 0.1, far: 220, position: [0, 16, 58] }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color("#070504");
        scene.fog = new THREE.Fog("#070504", 18, mobile ? 70 : 95);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      onPointerMove={(e) => {
        realm.pointer.x = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
        realm.pointer.y = clamp(-((e.clientY / window.innerHeight) * 2 - 1), -1, 1);
      }}
    >
      <PerformanceMonitor
        bounds={() => [42, 58]}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(mobile ? 1.25 : 1.75, d + 0.25))}
      />
      <CameraRig />
      <ambientLight intensity={0.18} />
      <directionalLight position={[-8, 12, 6]} intensity={0.9} color="#ffe2b8" />
      <directionalLight position={[10, 6, -12]} intensity={0.6} color="#9c7bff" />

      <Suspense fallback={null}>
        <Environment files="/realm/hdr/studio_small_09_1k.hdr" environmentIntensity={0.9} />
        <Gate />
        <Inky />
        <Ready onReady={onReady} />
        <Precompile />
      </Suspense>

      {fontReady && (
        <Suspense fallback={null}>
          <Realm />
        </Suspense>
      )}
      <Suspense fallback={null}>
        {events.length > 0 && <Screens items={events} />}
      </Suspense>
      <Suspense fallback={null}>
        {workshops.length > 0 && <Carousel items={workshops} />}
      </Suspense>
      <Suspense fallback={null}>
        <Bubble />
      </Suspense>
      <Dust />

      <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
        <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.72} luminanceSmoothing={0.25} radius={0.7} />
        <ChromaticAberration offset={new THREE.Vector2(0.0007, 0.0006)} radialModulation modulationOffset={0.35} blendFunction={BlendFunction.NORMAL} />
        <Noise premultiply opacity={0.32} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette eskil={false} offset={0.22} darkness={0.78} />
      </EffectComposer>
    </Canvas>
  );
}
