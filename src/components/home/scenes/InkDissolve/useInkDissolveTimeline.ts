"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Px = { ax: number; ay: number; bx: number; by: number; dx: number; dy: number; s: number; d: number };

/** Rasterises `text` with the display font and returns filled-pixel positions. */
function sample(text: string, w: number, h: number, step: number, font: string) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  let size = Math.min(h * 0.42, 260);
  ctx.font = `900 ${size}px ${font}`;
  const lines = text.split(" ");
  const fit = () => Math.max(...lines.map((l) => ctx.measureText(l).width));
  while (fit() > w * 0.86 && size > 20) {
    size -= 4;
    ctx.font = `900 ${size}px ${font}`;
  }
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lh = size * 0.92;
  lines.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * lh));
  const data = ctx.getImageData(0, 0, w, h).data;
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (data[(y * w + x) * 4 + 3] > 128) pts.push({ x, y });
  return pts;
}

/**
 * Pinned and scrubbed. 0–0.45: `from` holds then dissolves into drifting ink
 * pixels. 0.45–1: the pixels re-form as `to`.
 */
export function useInkDissolveTimeline(
  scope: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  opts: { from: string; to: string; reduced: boolean; mobile: boolean; ready: boolean },
) {
  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas || !opts.ready || opts.reduced) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const font = getComputedStyle(document.documentElement).getPropertyValue("--font-ink-display").trim() || "Impact";
      const state = { p: 0 };
      let pixels: Px[] = [];
      let step = 6;

      const build = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        step = opts.mobile ? 6 : 5;
        const a = sample(opts.from, w, h, step, font);
        const b = sample(opts.to, w, h, step, font);
        const n = Math.max(a.length, b.length);
        pixels = Array.from({ length: n }, (_, i) => {
          const pa = a[i % a.length];
          const pb = b[(i * 7919) % b.length];
          const ang = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * Math.max(w, h) * 0.45;
          return {
            ax: pa.x,
            ay: pa.y,
            bx: pb.x,
            by: pb.y,
            dx: (pa.x + pb.x) / 2 + Math.cos(ang) * dist,
            dy: (pa.y + pb.y) / 2 + Math.sin(ang) * dist * 0.6,
            s: step * (0.5 + Math.random() * 0.6),
            d: Math.random() * 0.35,
          };
        });
        draw();
      };

      const ease = (t: number) => t * t * (3 - 2 * t);
      const draw = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#d9ad62";
        const p = state.p;
        for (const px of pixels) {
          // out: 0.1 → 0.5, in: 0.5 → 0.9, each pixel offset by its delay
          const tOut = ease(Math.min(1, Math.max(0, (p - 0.1 - px.d * 0.4) / 0.32)));
          const tIn = ease(Math.min(1, Math.max(0, (p - 0.5 - px.d * 0.4) / 0.32)));
          let x: number;
          let y: number;
          if (tIn <= 0) {
            x = px.ax + (px.dx - px.ax) * tOut;
            y = px.ay + (px.dy - px.ay) * tOut;
          } else {
            x = px.dx + (px.bx - px.dx) * tIn;
            y = px.dy + (px.by - px.dy) * tIn;
          }
          const scatter = tIn > 0 ? 1 - tIn : tOut;
          const size = px.s * (1 + scatter * 0.8);
          ctx.globalAlpha = 0.55 + 0.45 * (1 - scatter);
          ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
      };

      void document.fonts.ready.then(build);
      window.addEventListener("resize", build);
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: draw,
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: opts.mobile ? "+=120%" : "+=160%",
          pin: true,
          scrub: 0.5,
        },
      });
      return () => window.removeEventListener("resize", build);
    },
    { scope, dependencies: [opts.from, opts.to, opts.reduced, opts.mobile, opts.ready] },
  );
}
