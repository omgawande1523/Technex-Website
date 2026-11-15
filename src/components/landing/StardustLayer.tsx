"use client";

import React, { useEffect, useRef } from "react";

// Must match the landing background (/assets/bg/tnx-cave-art-bg.webp) and its
// background-position in src/app/landing.module.css.
const BG_W = 1670;
const BG_H = 941;
const BG_POS_X_DESKTOP = 0.5;
const BG_POS_X_MOBILE = 0.85;

// Light beam in image pixels: from the cave opening (top right) down toward the water.
const BEAM_TOP = { x: 1370, y: 140 };
const BEAM_BOTTOM = { x: 690, y: 780 };
const BEAM_WIDTH_TOP = 200;
const BEAM_WIDTH_BOTTOM = 460;
// Open starfield area behind the beam, for slow twinkles
const FIELD = { x0: 520, y0: 90, x1: 1560, y1: 660 };

type Mote = {
  t: number; // 0..1 along the beam
  lateral: number; // -0.5..0.5 across the beam
  speed: number;
  sway: number;
  size: number;
  phase: number;
  twinkle: number;
  color: number; // sprite index
};

type Star = { x: number; y: number; size: number; phase: number; twinkle: number; color: number };

const COLORS = ["255,244,222", "255,214,150", "190,232,255"];

function makeSprite(rgb: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.18, `rgba(${rgb},0.85)`);
  grad.addColorStop(0.45, `rgba(${rgb},0.18)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return c;
}

const pickColor = () => {
  const r = Math.random();
  return r < 0.62 ? 0 : r < 0.82 ? 1 : 2;
};

export default function StardustLayer({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduced-motion users still get the ambient effect, just slower and calmer
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionScale = reduceMotion ? 0.35 : 1;
    const sprites = COLORS.map(makeSprite);

    const motes: Mote[] = Array.from({ length: 170 }, () => ({
      t: Math.random(),
      lateral: (Math.random() + Math.random() + Math.random()) / 3 - 0.5, // denser at the beam centre
      speed: 0.012 + Math.random() * 0.025,
      sway: 4 + Math.random() * 10,
      size: Math.random() < 0.92 ? 1 + Math.random() * 1.6 : 2.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.8 + Math.random() * 2.4,
      color: pickColor(),
    }));

    const stars: Star[] = Array.from({ length: 80 }, () => ({
      x: FIELD.x0 + Math.random() * (FIELD.x1 - FIELD.x0),
      y: FIELD.y0 + Math.random() * (FIELD.y1 - FIELD.y0),
      size: 0.9 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.4 + Math.random() * 1.6,
      color: pickColor(),
    }));

    let w = 0;
    let h = 0;
    let s = 1;
    let ox = 0;
    let oy = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      // Same "cover" mapping the CSS background uses
      s = Math.max(w / BG_W, h / BG_H);
      const posX = w <= 860 ? BG_POS_X_MOBILE : BG_POS_X_DESKTOP;
      ox = (w - BG_W * s) * posX;
      oy = (h - BG_H * s) * 0.5;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawSprite = (x: number, y: number, size: number, alpha: number, color: number) => {
      if (alpha <= 0.01) return;
      const d = size * 4 * s;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.drawImage(sprites[color], x - d / 2, y - d / 2, d, d);
    };

    let raf = 0;
    let last = performance.now();
    let time = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * motionScale;
      last = now;
      time += dt;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Slow twinkling stars in the open field
      for (const st of stars) {
        const tw = 0.5 + 0.5 * Math.sin(time * st.twinkle + st.phase);
        drawSprite(ox + st.x * s, oy + st.y * s, st.size, 0.06 + tw * tw * 0.26, st.color);
      }

      // Dust motes drifting down the light beam
      const ax = BEAM_TOP.x;
      const ay = BEAM_TOP.y;
      const bx = BEAM_BOTTOM.x - ax;
      const by = BEAM_BOTTOM.y - ay;
      const len = Math.hypot(bx, by);
      const nx = -by / len; // unit normal across the beam
      const ny = bx / len;
      for (const m of motes) {
        m.t += m.speed * dt;
        if (m.t > 1) {
          m.t -= 1;
          m.lateral = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        }
        const width = BEAM_WIDTH_TOP + (BEAM_WIDTH_BOTTOM - BEAM_WIDTH_TOP) * m.t;
        const sway = Math.sin(time * 0.6 + m.phase) * m.sway;
        const px = ax + bx * m.t + nx * (m.lateral * width + sway);
        const py = ay + by * m.t + ny * (m.lateral * width + sway);
        // Fade in near the opening and out toward the floor; brighter at beam centre
        const fade = Math.min(1, m.t / 0.08) * Math.min(1, (1 - m.t) / 0.25);
        const centre = 1 - Math.abs(m.lateral) * 1.3;
        const tw = 0.5 + 0.5 * Math.sin(time * m.twinkle + m.phase);
        drawSprite(ox + px * s, oy + py * s, m.size, fade * centre * (0.1 + tw * 0.35), m.color);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}
    />
  );
}
