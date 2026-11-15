"use client";

/**
 * InkHologramCanvas — React Three Fiber port of the previous raw-three hero
 * hologram. The same four models (humanoid, flying machine, watercraft,
 * neural network) become clouds of gold ink particles that morph into each
 * other, drift like wet ink and lean toward the pointer. Each model is loaded
 * only when its form is next in line. Desktop gets a halftone + bloom pass.
 */
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { trackProgress } from "@/lib/preload";
import { Halftone } from "./HalftoneEffect";
import { HOLOGRAM_FORMS, loadModelPoints, seedCloud } from "./modelPoints";

const vertex = /* glsl */ `
attribute vec3 aTo;
attribute float aRand;
uniform float uMorph;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
varying float vAlpha;
varying float vHeat;
void main() {
  float t = clamp((uMorph - aRand * 0.35) / 0.65, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(position, aTo, t);
  float arc = sin(t * 3.14159);
  p += normalize(p + 0.0001) * arc * (0.18 + aRand * 0.45);
  p.x += sin(uTime * 0.6 + aRand * 20.0 + p.y * 2.0) * 0.012;
  p.y += cos(uTime * 0.5 + aRand * 13.0) * 0.012;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.55 + aRand) / -mv.z;
  vAlpha = 0.3 + aRand * 0.5;
  vHeat = arc;
}
`;

const fragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
varying float vHeat;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.0, d);
  vec3 col = mix(uColor, vec3(1.0, 0.93, 0.78), vHeat * 0.6 + soft * 0.25);
  gl_FragColor = vec4(col, soft * vAlpha);
}
`;


/** Owns the GPU objects for one particle cloud; React only drives it. */
class InkCloud {
  readonly geometry = new THREE.BufferGeometry();
  readonly material: THREE.ShaderMaterial;

  constructor(count: number) {
    const seed = seedCloud(count);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(seed, 3));
    this.geometry.setAttribute("aTo", new THREE.BufferAttribute(seed.slice(), 3));
    this.geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 3);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uMorph: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 19 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color("#d9ad62") },
      },
    });
  }

  setPixelRatio(dpr: number) {
    this.material.uniforms.uPixelRatio.value = dpr;
  }

  tick(time: number) {
    this.material.uniforms.uTime.value = time;
  }

  /** Morph from the current shape to `points`, then make it the current shape. */
  morphTo(points: Float32Array, duration: number, onDone?: () => void) {
    const to = this.geometry.getAttribute("aTo") as THREE.BufferAttribute;
    (to.array as Float32Array).set(points);
    to.needsUpdate = true;
    const morph = this.material.uniforms.uMorph;
    morph.value = 0;
    gsap.to(morph, {
      value: 1,
      duration,
      ease: "power2.inOut",
      onComplete: () => {
        const pos = this.geometry.getAttribute("position") as THREE.BufferAttribute;
        (pos.array as Float32Array).set(points);
        pos.needsUpdate = true;
        morph.value = 0;
        onDone?.();
      },
    });
  }

  dispose() {
    gsap.killTweensOf(this.material.uniforms.uMorph);
    this.geometry.dispose();
    this.material.dispose();
  }
}

type Props = {
  mobile: boolean;
  reduced: boolean;
  /** Pixels to shift the figure right of centre (desktop layout). */
  offsetX?: number;
};

function Cloud({ count, reduced, offsetX = 0 }: { count: number; reduced: boolean; offsetX?: number }) {
  const group = useRef<THREE.Group>(null);
  const { gl, pointer } = useThree();
  const formIndex = useRef(0);

  const [cloud] = useState(() => new InkCloud(count));

  useEffect(() => {
    cloud.setPixelRatio(gl.getPixelRatio());
  }, [gl, cloud]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const first = trackProgress(2);

    const morphTo = (points: Float32Array, onDone?: () => void) => cloud.morphTo(points, reduced ? 0 : 2.4, onDone);

    const cycle = () => {
      if (cancelled || reduced) return;
      const next = (formIndex.current + 1) % HOLOGRAM_FORMS.length;
      // Fetch the next form while the current one is on screen.
      const pending = loadModelPoints(HOLOGRAM_FORMS[next].url, count);
      timer = window.setTimeout(() => {
        pending
          .then((pts) => {
            if (cancelled) return;
            formIndex.current = next;
            morphTo(pts, cycle);
          })
          .catch((err) => {
            console.warn(`[InkHologram] ${HOLOGRAM_FORMS[next].id} failed to load`, err);
            formIndex.current = next;
            cycle();
          });
      }, 6500);
    };

    loadModelPoints(HOLOGRAM_FORMS[0].url, count, (f) => first.update(f))
      .then((pts) => {
        first.done();
        if (!cancelled) morphTo(pts, cycle);
      })
      .catch((err) => {
        console.warn("[InkHologram] first form failed to load", err);
        first.done();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [count, cloud, reduced]);

  useEffect(() => () => cloud.dispose(), [cloud]);

  useFrame((state, delta) => {
    cloud.tick(state.clock.elapsedTime);
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, delta * 2.5);
    const targetY = (reduced ? 0 : state.clock.elapsedTime * 0.12) + pointer.x * 0.45;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (-pointer.y * 0.18 - g.rotation.x) * k;
    g.position.x += (offsetX + pointer.x * 0.15 - g.position.x) * k;
  });

  return (
    <group ref={group}>
      <points geometry={cloud.geometry} material={cloud.material} frustumCulled={false} />
    </group>
  );
}

export default function InkHologramCanvas({ mobile, reduced, offsetX = 0 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering when the hero is off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={mobile ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0.1, 5.2], fov: 38 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Cloud key={mobile ? "m" : "d"} count={mobile ? 9000 : 26000} reduced={reduced} offsetX={offsetX} />
        {!mobile && (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.45} luminanceThreshold={0.55} luminanceSmoothing={0.2} mipmapBlur radius={0.55} />
            <Halftone cell={4.5} mix={0.42} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
