//Infinite gallery engine
import * as THREE from "three";
import gsap from "gsap";

import type { GalleryMedia, MediaItem } from "@/lib/types";
import {
  PATTERNS,
  PATTERN_ORDER,
  loopMedia,
  type PatternKey,
} from "@/lib/gallery/patterns";

// ---------------- config ----------------
const SEG = 420;
const HW = 3.2;
const HH = 3.2;
const GAP = 0;
const STATIONS = 110;
const RING_RADIUS = 92;

const params = {
  speed: 0.0075,
  cell: 0.8,
  gridIntensity: 0.5,
  floorReflect: 0.32,
  mouseAmp: 0.12,
  fadeFar: 58,
  panelFar: 64,
};

const GOLD_ICE = 0xe6c35c;
const GOLD_ACCENT = 0xffdc78;

// ---------------- engine types ----------------
interface Face {
  off: [number, number];
  a: [number, number];
  b: [number, number];
}

interface ImageSlot {
  aspect: number;
  ready: boolean;
  waiting: Array<(a: number) => void>;
  texture: THREE.Texture;
}

interface LoopSlot {
  src: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  aspect: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  active: boolean;
  panels: Panel[];
}

interface Panel {
  index: number;
  mesh: THREE.Mesh;
  reflection: THREE.Mesh | null;
  material: THREE.ShaderMaterial;
  media: GalleryMedia;
  faceId: number;
  t: number;
  w: number;
  h: number;
  center: THREE.Vector3;
  inward: THREE.Vector3;
  up: THREE.Vector3;
  aspect: number;
  setAspect(a: number): void;
  loopSlot?: LoopSlot;
}

interface EngineState {
  t: number;
  speedMul: number;
  focus: Panel | null;
  focusMix: number;
  hovered: Panel | null;
  mouse: THREE.Vector2;
  aim: THREE.Vector2;
  aimTarget: THREE.Vector2;
  currentIndex: number;
  /** Pending travel offset (in loop units) requested by wheel scrolling. */
  scrollOffset: number;
}

export interface GalleryUiRefs {
  counter: HTMLElement;
  total: HTMLElement;
  card: HTMLElement;
}

export interface GalleryHooks {
  /** Called when the engine fails to start (e.g. WebGL unavailable). */
  onFatal?: (message: string) => void;
}

// ---------------- entry point ----------------
export function startGallery(
  canvas: HTMLCanvasElement,
  ui: GalleryUiRefs,
  hooks?: GalleryHooks,
): { dispose: () => void; ready: Promise<void> } {
  const galleryRoot = canvas.parentElement;
  const isGalleryTarget = (target: EventTarget | null): boolean =>
    target instanceof Node && galleryRoot?.contains(target) === true;
  let disposed = false;
  let cleanup: Array<() => void> = [];

  const run = async () => {
    try {
      await runEngine();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[InfiniteGallery]", e);
      hooks?.onFatal?.(msg);
    }
  };

  const runEngine = async () => {
    // --- media (photos from /api/media + procedural loops) ---
    const res = await fetch("/api/media");
    if (!res.ok) {
      throw new Error(`MEDIA API FAILED (${res.status})`);
    }
    const mediaFiles = (await res.json()) as MediaItem[];
    if (disposed) return;

    const MEDIA: GalleryMedia[] = [
      ...mediaFiles.map(
        (m): GalleryMedia => ({ type: "image", src: m.src, title: m.title }),
      ),
      ...PATTERN_ORDER.map((k) => loopMedia(k as PatternKey)),
    ];

    // --- scene ---
    const scene = new THREE.Scene();
    scene.background = null;

    // WebGL sanity check — fail loudly with a visible message instead of a black page.
    const glProbe =
      canvas.getContext("webgl2") ?? (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!glProbe) {
      throw new Error(
        "WEBGL IS NOT AVAILABLE — enable hardware acceleration or update your GPU drivers",
      );
    }

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      160,
    );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;

    let seed = 20260725;
    const rand = (): number => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    // --- path ---
    const pathPoints: THREE.Vector3[] = [];
    const RING_POINTS = 24;
    for (let i = 0; i < RING_POINTS; i++) {
      const a = (i / RING_POINTS) * Math.PI * 2;
      const r = RING_RADIUS * (1 + Math.sin(a * 3) * 0.14 + (rand() - 0.5) * 0.06);
      pathPoints.push(
        new THREE.Vector3(
          Math.cos(a) * r,
          Math.sin(a * 2) * 7 + Math.sin(a * 5) * 2.5,
          Math.sin(a) * r,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(pathPoints, true, "catmullrom", 0.5);
    curve.arcLengthDivisions = 4000;
    const totalLength = curve.getLength();
    const frames = curve.computeFrenetFrames(SEG, true);
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= SEG; i++)
      ringPoints.push(curve.getPointAt((i % SEG) / SEG));

    const cellV = totalLength / Math.round(totalLength / params.cell);

    // --- tunnel ---
    const HWi = HW * (1 - GAP);
    const HHi = HH * (1 - GAP);
    const FACES: Face[] = [
      { off: [HW, 0], a: [0, -HHi], b: [0, HHi] }, // right (+B)
      { off: [-HW, 0], a: [0, -HHi], b: [0, HHi] }, // left (-B)
      { off: [0, HH], a: [-HWi, 0], b: [HWi, 0] }, // ceiling (+N)
      { off: [0, -HH], a: [-HWi, 0], b: [HWi, 0] }, // floor (-N)
    ];

    function buildTunnelGeometry(): THREE.BufferGeometry {
      const pos: number[] = [];
      const uv: number[] = [];
      const edge: number[] = [];
      const idx: number[] = [];
      const tmp = new THREE.Vector3();

      FACES.forEach((face) => {
        const base = pos.length / 3;
        const span = Math.hypot(face.b[0] - face.a[0], face.b[1] - face.a[1]);

        for (let i = 0; i <= SEG; i++) {
          const p = ringPoints[i];
          const N = frames.normals[i % SEG];
          const B = frames.binormals[i % SEG];
          const v = (i / SEG) * totalLength;

          for (let k = 0; k < 2; k++) {
            const c = k === 0 ? face.a : face.b;
            tmp
              .copy(p)
              .addScaledVector(B, face.off[0] + c[0])
              .addScaledVector(N, face.off[1] + c[1]);
            pos.push(tmp.x, tmp.y, tmp.z);
            uv.push(k * span, v);
            edge.push(k);
          }
        }

        for (let i = 0; i < SEG; i++) {
          const a = base + i * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      });

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setAttribute("aEdge", new THREE.Float32BufferAttribute(edge, 1));
      geo.setIndex(idx);
      return geo;
    }

    const gridMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uCellU: { value: params.cell },
        uCellV: { value: cellV },
        uColor: { value: new THREE.Color(GOLD_ICE) },
        uAccent: { value: new THREE.Color(GOLD_ACCENT) },
        uIntensity: { value: params.gridIntensity },
        uTime: { value: 0 },
        uFar: { value: params.fadeFar },
        uHeadV: { value: 0 },
        uLoop: { value: totalLength },
      },
      vertexShader: /* glsl */ `
        attribute float aEdge;
        varying vec2 vUv;
        varying float vEdge;
        varying float vDist;

        void main() {
          vUv = uv;
          vEdge = aEdge;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vDist = -mv.z;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uCellU;
        uniform float uCellV;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uIntensity;
        uniform float uTime;
        uniform float uFar;
        uniform float uHeadV;
        uniform float uLoop;

        varying vec2 vUv;
        varying float vEdge;
        varying float vDist;

        float gridLine(float x, float cell) {
          float c = x / cell;
          float d = abs(fract(c - 0.5) - 0.5) / max(fwidth(c), 1e-5);
          return 1.0 - clamp(d, 0.0, 1.0);
        }

        void main() {
          float lu = gridLine(vUv.x, uCellU);
          float lv = gridLine(vUv.y, uCellV);
          float line = max(lu, lv);

          float e = min(vEdge, 1.0 - vEdge);
          float rim = 1.0 - clamp(e / max(fwidth(vEdge), 1e-5), 0.0, 1.0);

          float wave = 0.5 + 0.5 * sin(vUv.y * 0.055 - uTime * 0.35);

          float dv = mod(vUv.y - uHeadV + uLoop * 0.5, uLoop) - uLoop * 0.5;
          float win =
            smoothstep(-16.0, -7.0, dv) * (1.0 - smoothstep(uFar * 0.3, uFar, dv));

          float fadeNear = smoothstep(0.6, 7.0, vDist);
          float fade = win * fadeNear;

          float a = (line * 0.8 + rim * 0.95) * uIntensity * fade;
          a *= mix(0.78, 1.12, wave);
          if (a < 0.002) discard;

          vec3 col = mix(uColor, uAccent, rim * 0.5 + wave * 0.12);
          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const tunnel = new THREE.Mesh(buildTunnelGeometry(), gridMaterial);
    tunnel.frustumCulled = false;
    scene.add(tunnel);

    // --- texture loading ---
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const imageSlots = new Map<string, ImageSlot>();
    const loopSlots = new Map<string, LoopSlot>();
    const loopEntries: LoopSlot[] = [];

    interface LoadResult {
      texture: THREE.Texture;
      loopSlot?: LoopSlot;
    }

    function loadMedia(entry: GalleryMedia, onAspect: (a: number) => void): LoadResult {
      if (entry.type === "image") {
        let slot = imageSlots.get(entry.src);
        if (!slot) {
          slot = { aspect: 1, ready: false, waiting: [], texture: null as unknown as THREE.Texture };
          slot.texture = textureLoader.load(entry.src, (t) => {
            slot!.aspect = t.image.width / t.image.height;
            slot!.ready = true;
            slot!.waiting.forEach((fn) => fn(slot!.aspect));
            slot!.waiting.length = 0;
          });
          slot.texture.colorSpace = THREE.SRGBColorSpace;
          slot.texture.anisotropy = maxAniso;
          imageSlots.set(entry.src, slot);
        }
        if (slot.ready) onAspect(slot.aspect);
        else slot.waiting.push(onAspect);
        return { texture: slot.texture };
      }

      let slot = loopSlots.get(entry.src);
      if (!slot) {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 640;
        const ctx = c.getContext("2d")!;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        slot = {
          src: entry.src,
          canvas: c,
          ctx,
          texture: tex,
          aspect: c.width / c.height,
          draw: PATTERNS[entry.src.slice(4) as PatternKey],
          active: true,
          panels: [],
        };
        slot.draw(ctx, c.width, c.height, 0);
        loopSlots.set(entry.src, slot);
        loopEntries.push(slot);
      }
      onAspect(slot.aspect);
      return { texture: slot.texture, loopSlot: slot };
    }

    // --- panel shaders ---
    const panelVertex = /* glsl */ `
      varying vec2 vUv;
      varying float vDist;

      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `;

    const panelFragment = /* glsl */ `
      uniform sampler2D uMap;
      uniform vec2 uCrop;
      uniform vec3 uFrame;
      uniform float uHover;
      uniform float uReflect;
      uniform float uFar;
      uniform float uOpacity;

      varying vec2 vUv;
      varying float vDist;

      void main() {
        vec2 uv = 0.5 + (vUv - 0.5) * uCrop;
        vec3 col = texture2D(uMap, uv).rgb;

        vec2 d = min(vUv, 1.0 - vUv);
        float edge = 1.0 - smoothstep(0.0, 0.012, min(d.x, d.y));
        float halo = 1.0 - smoothstep(0.012, 0.06, min(d.x, d.y));

        col *= mix(1.0, 1.16, uHover);
        col += uFrame * edge * mix(0.22, 0.85, uHover);
        col += uFrame * halo * mix(0.03, 0.16, uHover);

        float fade = 1.0 - smoothstep(uFar * 0.55, uFar, vDist);

        if (uReflect > 0.5) {
          float a = uOpacity * fade * (1.0 - smoothstep(0.0, 0.8, vUv.y));
          if (a < 0.004) discard;
          gl_FragColor = vec4(col * 0.72, a);
        } else {
          gl_FragColor = vec4(col * fade, 1.0);
        }
      }
    `;

    const raycaster = new THREE.Raycaster();
    const panels: Panel[] = [];

    // --- panel placement ---
    const WALL_FOOTPRINTS: Array<[number, number]> = [
      [3, 5],
      [4, 6],
      [6, 4],
      [2, 3],
      [5, 5],
      [3, 4],
      [7, 4],
    ];
    const CAP_FOOTPRINTS: Array<[number, number]> = [
      [5, 3],
      [4, 4],
      [6, 4],
      [3, 2],
    ];

    const FACE_ORDER = [
      0, 1, 2, 0, 1, 3, 0, 1, 2, 0, 1, 0, 1, 3, 0, 1, 2, 0, 1, 0, 3, 1, 0, 2,
      1, 0,
    ];

    const IMAGES = MEDIA.filter((m) => m.type === "image");
    const LOOPS = MEDIA.filter((m) => m.type === "loop");

    function mediaFor(i: number): GalleryMedia {
      return i % 3 === 2
        ? LOOPS[Math.floor(i / 3) % LOOPS.length]
        : IMAGES[(i - Math.floor(i / 3)) % IMAGES.length];
    }

    const CELLS_ACROSS = Math.round((2 * HW) / params.cell);
    let vSlot = 0;

    const _p = new THREE.Vector3();
    const _n = new THREE.Vector3();
    const _b = new THREE.Vector3();
    const _v = new THREE.Vector3();

    function frameAt(
      t: number,
      outP: THREE.Vector3,
      outN: THREE.Vector3,
      outB: THREE.Vector3,
    ): void {
      const tt = ((t % 1) + 1) % 1;
      const f = tt * SEG;
      const i0 = Math.floor(f) % SEG;
      const i1 = (i0 + 1) % SEG;
      const k = f - Math.floor(f);
      outP.copy(curve.getPointAt(tt));
      outN.copy(frames.normals[i0]).lerp(frames.normals[i1], k).normalize();
      outB.copy(frames.binormals[i0]).lerp(frames.binormals[i1], k).normalize();
    }

    function surfacePoint(
      faceId: number,
      v: number,
      across: number,
      out: THREE.Vector3,
    ): THREE.Vector3 {
      frameAt(v / totalLength, _p, _n, _b);
      out.copy(_p);
      if (faceId === 0)
        out.addScaledVector(_b, HW - 0.03).addScaledVector(_n, across);
      else if (faceId === 1)
        out.addScaledVector(_b, -(HW - 0.03)).addScaledVector(_n, across);
      else if (faceId === 2)
        out.addScaledVector(_n, HH - 0.03).addScaledVector(_b, across);
      else out.addScaledVector(_n, -(HH - 0.03)).addScaledVector(_b, across);
      return out;
    }

    function buildPanelGeometry(
      faceId: number,
      v0: number,
      v1: number,
      a0: number,
      a1: number,
    ): THREE.BufferGeometry {
      const wall = faceId < 2;
      const steps = Math.max(2, Math.ceil(Math.abs(v1 - v0) / (cellV * 0.34)));
      const pos: number[] = [];
      const uv: number[] = [];
      const idx: number[] = [];

      for (let j = 0; j <= steps; j++) {
        const s = j / steps;
        const v = v0 + (v1 - v0) * s;
        for (let k = 0; k < 2; k++) {
          const a = k === 0 ? a0 : a1;
          surfacePoint(faceId, v, a, _v);
          pos.push(_v.x, _v.y, _v.z);
          if (wall) uv.push(faceId === 0 ? 1 - s : s, k);
          else uv.push(faceId === 2 ? 1 - k : k, s);
        }
      }

      for (let j = 0; j < steps; j++) {
        const b = j * 2;
        idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeBoundingSphere();
      return geo;
    }

    function makePanel(i: number): Panel {
      const media = mediaFor(i);
      const faceId = FACE_ORDER[i % FACE_ORDER.length];
      const wall = faceId < 2;
      const fp = wall
        ? WALL_FOOTPRINTS[Math.floor(rand() * WALL_FOOTPRINTS.length)]
        : CAP_FOOTPRINTS[Math.floor(rand() * CAP_FOOTPRINTS.length)];

      const cellsX = fp[0];
      const cellsY = fp[1];
      const cellsAlong = wall ? cellsX : cellsY;
      const cellsAcross = wall ? cellsY : cellsX;

      const totalSlots = Math.round(totalLength / cellV);
      const stride = Math.floor(totalSlots / STATIONS);
      vSlot = Math.max(vSlot, i * stride);
      const kStart = vSlot % totalSlots;
      vSlot += cellsAlong + 2 + Math.floor(rand() * 3);

      const vA = kStart * cellV + 0.01;
      const vB = (kStart + cellsAlong) * cellV - 0.01;
      const vCenter = (vA + vB) * 0.5;
      const t = (vCenter / totalLength) % 1;

      const mMax = CELLS_ACROSS - cellsAcross;
      const m = Math.max(0, Math.min(mMax, 1 + Math.floor(rand() * (mMax - 1))));
      const aA = m * params.cell - HW + 0.01;
      const aB = (m + cellsAcross) * params.cell - HW - 0.01;
      const across = (aA + aB) * 0.5;

      const w = wall ? vB - vA : aB - aA;
      const h = wall ? aB - aA : vB - vA;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: null },
          uCrop: { value: new THREE.Vector2(1, 1) },
          uFrame: { value: new THREE.Color(GOLD_ACCENT) },
          uHover: { value: 0 },
          uReflect: { value: 0 },
          uFar: { value: params.panelFar },
          uOpacity: { value: 1 },
        },
        vertexShader: panelVertex,
        fragmentShader: panelFragment,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(
        buildPanelGeometry(faceId, vA, vB, aA, aB),
        material,
      );
      mesh.frustumCulled = false;
      scene.add(mesh);

      const center = surfacePoint(faceId, vCenter, across, new THREE.Vector3());
      frameAt(t, _p, _n, _b);
      const inward = new THREE.Vector3();
      if (faceId === 0) inward.copy(_b).multiplyScalar(-1);
      else if (faceId === 1) inward.copy(_b);
      else if (faceId === 2) inward.copy(_n).multiplyScalar(-1);
      else inward.copy(_n);
      const up = wall
        ? _n.clone()
        : _p
            .clone()
            .sub(curve.getPointAt((((t - 0.004) % 1) + 1) % 1))
            .normalize();

      let reflection: THREE.Mesh | null = null;
      if (wall && params.floorReflect > 0) {
        const refMat = material.clone();
        refMat.uniforms.uMap = material.uniforms.uMap;
        refMat.uniforms.uCrop = material.uniforms.uCrop;
        refMat.uniforms.uHover = material.uniforms.uHover;
        refMat.uniforms.uReflect.value = 1;
        refMat.uniforms.uOpacity.value = params.floorReflect;
        refMat.transparent = true;
        refMat.depthWrite = false;
        reflection = new THREE.Mesh(
          buildPanelGeometry(faceId, vA, vB, -2 * HH - aA, -2 * HH - aB),
          refMat,
        );
        reflection.frustumCulled = false;
        scene.add(reflection);
      }

      const panel: Panel = {
        index: i,
        mesh,
        reflection,
        material,
        media,
        faceId,
        t,
        w,
        h,
        center,
        inward,
        up,
        aspect: w / h,
        setAspect(a: number) {
          const panelAspect = w / h;
          const crop = material.uniforms.uCrop.value as THREE.Vector2;
          if (a > panelAspect) crop.set(panelAspect / a, 1);
          else crop.set(1, a / panelAspect);
        },
      };

      const loaded = loadMedia(media, (a) => panel.setAspect(a));
      material.uniforms.uMap.value = loaded.texture;
      if (loaded.loopSlot) {
        loaded.loopSlot.panels.push(panel);
        panel.loopSlot = loaded.loopSlot;
      }

      mesh.userData.panel = panel;
      panels.push(panel);
      return panel;
    }

    for (let i = 0; i < STATIONS; i++) makePanel(i);

    // --- UI refs ---
    const counterEl = ui.counter;
    const cardEl = ui.card;
    const cardTitle = cardEl.querySelector<HTMLElement>(".t")!;
    const cardMeta = cardEl.querySelector<HTMLElement>(".m")!;
    ui.total.textContent = String(STATIONS).padStart(2, "0");

    // --- state ---
    const state: EngineState = {
      t: 0,
      speedMul: 1,
      focus: null,
      focusMix: 0,
      hovered: null,
      mouse: new THREE.Vector2(-2, -2),
      aim: new THREE.Vector2(0, 0),
      aimTarget: new THREE.Vector2(0, 0),
      currentIndex: -1,
      scrollOffset: 0,
    };

    const travelPos = new THREE.Vector3();
    const travelQuat = new THREE.Quaternion();
    const lookTarget = new THREE.Vector3();
    const focusPos = new THREE.Vector3();
    const focusQuat = new THREE.Quaternion();
    const mUp = new THREE.Vector3();
    const mAxis = new THREE.Vector3();
    const lookMatrix = new THREE.Matrix4();
    const aimQuat = new THREE.Quaternion();
    const aimEuler = new THREE.Euler();
    const rawQuat = new THREE.Quaternion();
    const smoothQuat = new THREE.Quaternion();
    let quatReady = false;
    let smoothRoll = 0;

    function frameIndexAt(t: number): number {
      return ((Math.round(t * SEG) % SEG) + SEG) % SEG;
    }

    function normalAt(t: number, out: THREE.Vector3): THREE.Vector3 {
      const f = ((t % 1) + 1) * SEG;
      const i0 = Math.floor(f) % SEG;
      const i1 = (i0 + 1) % SEG;
      return out
        .copy(frames.normals[i0])
        .lerp(frames.normals[i1], f - Math.floor(f))
        .normalize();
    }

    function updateTravel(dt: number): void {
      if (state.focus) {
        state.scrollOffset = 0;
      } else {
        // Deliver the scroll request smoothly (inertia glide toward the target).
        const move = state.scrollOffset * (1 - Math.exp(-4.5 * dt));
        state.scrollOffset -= move;
        if (Math.abs(state.scrollOffset) < 1e-5) state.scrollOffset = 0;
        if (move !== 0) state.t = (((state.t + move) % 1) + 1) % 1;
      }

      if (!state.focus)
        state.t = (state.t + params.speed * state.speedMul * dt) % 1;
      const t = state.t;
      travelPos.copy(curve.getPointAt(t));

      lookTarget.copy(curve.getPointAt((t + 0.022) % 1));
      normalAt(t, mUp);
      lookMatrix.lookAt(travelPos, lookTarget, mUp);
      rawQuat.setFromRotationMatrix(lookMatrix);

      if (!quatReady) {
        smoothQuat.copy(rawQuat);
        quatReady = true;
      } else {
        smoothQuat.slerp(rawQuat, 1 - Math.exp(-2.6 * dt));
      }
      travelQuat.copy(smoothQuat);

      mAxis
        .copy(frames.tangents[frameIndexAt(t)])
        .cross(frames.tangents[frameIndexAt((t + 0.02) % 1)]);
      const targetRoll = THREE.MathUtils.clamp(mAxis.dot(mUp) * 3.5, -0.1, 0.1);
      smoothRoll += (targetRoll - smoothRoll) * (1 - Math.exp(-1.8 * dt));

      aimEuler.set(state.aim.y, state.aim.x, smoothRoll, "YXZ");
      aimQuat.setFromEuler(aimEuler);
      travelQuat.multiply(aimQuat);
    }

    function focusTargets(panel: Panel): void {
      const dist = Math.max(panel.w / camera.aspect, panel.h) * 1.25;
      focusPos.copy(panel.center).addScaledVector(panel.inward, dist);
      mUp.copy(panel.up);
      lookMatrix.lookAt(focusPos, panel.center, mUp);
      focusQuat.setFromRotationMatrix(lookMatrix);
    }

    function openPanel(panel: Panel): void {
      state.focus = panel;
      gsap.to(state, { focusMix: 1, duration: 1.9, ease: "sine.inOut" });
      gsap.to(state, { speedMul: 0, duration: 1.3, ease: "sine.out" });
      cardTitle.textContent = panel.media.title;
      cardMeta.textContent = `${
        panel.media.type === "loop" ? "LOOP" : "IMAGE"
      } · OBRA ${String(panel.index + 1).padStart(2, "0")} / ${String(
        STATIONS,
      ).padStart(2, "0")}`;
      gsap.delayedCall(0.9, () => {
        if (state.focus === panel) cardEl.classList.add("on");
      });
    }

    function closePanel(): void {
      if (!state.focus) return;
      gsap.to(state, {
        focusMix: 0,
        duration: 1.7,
        ease: "sine.inOut",
        onComplete: () => {
          state.focus = null;
        },
      });
      gsap.to(state, {
        speedMul: 1,
        duration: 1.8,
        ease: "sine.inOut",
        delay: 0.5,
      });
      cardEl.classList.remove("on");
    }

    function setHover(panel: Panel | null): void {
      if (state.hovered === panel) return;
      if (state.hovered) {
        gsap.to(state.hovered.material.uniforms.uHover, {
          value: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
      state.hovered = panel;
      if (panel) {
        gsap.to(panel.material.uniforms.uHover, {
          value: 1,
          duration: 0.45,
          ease: "power2.out",
        });
      }
      if (galleryRoot) galleryRoot.style.cursor = panel ? "pointer" : "crosshair";
    }

    // --- pointer ---
    const onPointerMove = (e: PointerEvent): void => {
      if (!isGalleryTarget(e.target)) {
        state.mouse.set(-2, -2);
        state.aimTarget.set(0, 0);
        setHover(null);
        return;
      }
      state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      state.aimTarget.set(
        -state.mouse.x * params.mouseAmp,
        state.mouse.y * params.mouseAmp * 0.7,
      );
    };

    let downAt = 0;
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent): void => {
      if (!isGalleryTarget(e.target)) return;
      downAt = performance.now();
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent): void => {
      if (!isGalleryTarget(e.target)) return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved > 8 || performance.now() - downAt > 450) return;
      if (state.focus) {
        closePanel();
      } else if (state.hovered) {
        openPanel(state.hovered);
      }
    };

    const onCardDown = (e: PointerEvent): void => e.stopPropagation();
    const onCardUp = (e: PointerEvent): void => {
      e.stopPropagation();
      closePanel();
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") closePanel();
    };

    // Wheel scrolling glides the camera along the tunnel (fast travel).
    const SCROLL_GAIN = 0.00006; // loop units per wheel px (≈ half a panel per notch)
    const onWheel = (e: WheelEvent): void => {
      if (state.focus || !isGalleryTarget(e.target)) return;
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      state.scrollOffset = THREE.MathUtils.clamp(
        state.scrollOffset + d * SCROLL_GAIN,
        -0.5,
        0.5,
      );
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    cardEl.addEventListener("pointerdown", onCardDown);
    cardEl.addEventListener("pointerup", onCardUp);
    window.addEventListener("keydown", onKeyDown);

    cleanup.push(() => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("wheel", onWheel);
      cardEl.removeEventListener("pointerdown", onCardDown);
      cardEl.removeEventListener("pointerup", onCardUp);
      window.removeEventListener("keydown", onKeyDown);
      if (galleryRoot) galleryRoot.style.cursor = "";
    });

    // --- resize ---
    function fitCamera(): void {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.fov = camera.aspect < 0.75 ? 84 : 70;
      camera.updateProjectionMatrix();
    }
    fitCamera();

    const onResize = (): void => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      fitCamera();
    };
    window.addEventListener("resize", onResize);
    cleanup.push(() => window.removeEventListener("resize", onResize));

    // --- tick ---
    const clock = new THREE.Clock();
    let rafId = 0;

    function updateLoopActivity(): void {
      loopEntries.forEach((slot) => {
        slot.active = slot.panels.some(
          (p) => p.center.distanceToSquared(camera.position) < 55 * 55,
        );
      });
    }

    function updateHover(): void {
      if (state.focus) return;
      raycaster.setFromCamera(state.mouse, camera);
      const near: THREE.Mesh[] = [];
      panels.forEach((p) => {
        if (
          p.mesh.visible &&
          p.center.distanceToSquared(camera.position) < 45 * 45
        )
          near.push(p.mesh);
      });
      const hits = raycaster.intersectObjects(near, false);
      const hitPanel = hits.length
        ? (hits[0].object.userData.panel as Panel | undefined)
        : undefined;
      setHover(hitPanel ?? null);
    }

    const AHEAD = 0.085;
    const BEHIND = 0.012;

    function updatePanelVisibility(): void {
      let best = -1;
      let bestD = Infinity;
      panels.forEach((p) => {
        let d = p.t - state.t;
        if (d < 0) d += 1;
        const near = d < AHEAD || d > 1 - BEHIND;
        p.mesh.visible = near;
        if (p.reflection) p.reflection.visible = near;
        if (d < bestD) {
          bestD = d;
          best = p.index;
        }
      });
      if (state.focus) best = state.focus.index;
      if (best !== state.currentIndex) {
        state.currentIndex = best;
        counterEl.textContent = String(best + 1).padStart(2, "0");
      }
    }

    let loopTimer = 0;
    let activityTimer = 0;

    function tick(): void {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      state.aim.lerp(state.aimTarget, 1 - Math.pow(0.001, dt));
      updateTravel(dt);

      if (state.focus || state.focusMix > 0.001) {
        if (state.focus) focusTargets(state.focus);
        camera.position.lerpVectors(travelPos, focusPos, state.focusMix);
        camera.quaternion.slerpQuaternions(
          travelQuat,
          focusQuat,
          state.focusMix,
        );
      } else {
        camera.position.copy(travelPos);
        camera.quaternion.copy(travelQuat);
      }

      gridMaterial.uniforms.uTime.value = elapsed;
      gridMaterial.uniforms.uHeadV.value = state.t * totalLength;

      updatePanelVisibility();
      updateHover();

      activityTimer += dt;
      if (activityTimer > 0.4) {
        activityTimer = 0;
        updateLoopActivity();
      }

      loopTimer += dt;
      if (loopTimer > 1 / 24) {
        loopTimer = 0;
        loopEntries.forEach((slot) => {
          if (!slot.active) return;
          slot.draw(slot.ctx, slot.canvas.width, slot.canvas.height, elapsed);
          slot.texture.needsUpdate = true;
        });
      }

      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(tick);
    }

    rafId = window.requestAnimationFrame(tick);

    // --- dispose ---
    cleanup.push(() => {
      window.cancelAnimationFrame(rafId);
      gsap.killTweensOf(state);
      panels.forEach((p) => {
        p.mesh.geometry.dispose();
        p.material.dispose();
        if (p.reflection) {
          p.reflection.geometry.dispose();
          (p.reflection.material as THREE.Material).dispose();
        }
      });
      imageSlots.forEach((s) => s.texture.dispose());
      loopSlots.forEach((s) => s.texture.dispose());
      tunnel.geometry.dispose();
      gridMaterial.dispose();
      renderer.dispose();
    });

    disposeInternal = () => {
      cleanup.forEach((fn) => fn());
      cleanup = [];
    };
  };

  let disposeInternal: (() => void) | null = null;

  const runnerReady = run();

  return {
    dispose: () => {
      disposed = true;
      disposeInternal?.();
      disposeInternal = null;
    },
    ready: runnerReady,
  };
}
