"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPan;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }
void main(){
  vec2 uv = (gl_FragCoord.xy + uPan) / min(uRes.x, uRes.y);
  float h = fbm(uv * 2.2 + vec2(uTime * 0.02, -uTime * 0.015));
  float bands = h * 18.0;
  float d = abs(fract(bands) - 0.5) / max(fwidth(bands), 1e-3);
  float line = clamp(1.0 - (d - 0.25), 0.0, 1.0) * step(d, 50.0);
  float major = step(0.85, fract(bands / 5.0 + 0.1));
  vec3 gold = vec3(0.85, 0.68, 0.38);
  float a = line * (0.16 + major * 0.22);
  gl_FragColor = vec4(gold * a, a);
}`;

/**
 * Animated topographic contour lines in gold (WebGL isolines of fbm noise).
 * `pan` shifts the field so it moves with a draggable canvas.
 * Draws one still frame for reduced motion; renders nothing without WebGL.
 */
export default function ContourBackground({
  className,
  still = false,
  panRef,
}: {
  className?: string;
  still?: boolean;
  panRef?: React.RefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) return;
    gl.getExtension("OES_standard_derivatives");
    const frag = "#extension GL_OES_standard_derivatives : enable\n" + FRAG;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uPan = gl.getUniformLocation(prog, "uPan");

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.5);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const start = performance.now();
    const frame = () => {
      if (visible) {
        const pan = panRef?.current ?? { x: 0, y: 0 };
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, still ? 0 : (performance.now() - start) / 1000);
        gl.uniform2f(uPan, -pan.x * dpr * 0.6, pan.y * dpr * 0.6);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (!still) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [still, panRef]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
