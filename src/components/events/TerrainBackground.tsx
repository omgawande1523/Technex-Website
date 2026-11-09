"use client";
import { useEffect, useRef } from "react";

// Fixed full-screen dark background with soft, slow gold dust.
export default function TerrainBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = w < 700 ? 32 : 64;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.4,
      vy: Math.random() * 0.14 + 0.03,
      vx: (Math.random() - 0.5) * 0.08,
      a: Math.random() * 0.45 + 0.12,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduce) {
          p.y -= p.vy;
          p.x += p.vx;
          if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(233,196,106,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="terrain" aria-hidden>
      <canvas ref={ref} />
    </div>
  );
}