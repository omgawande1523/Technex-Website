'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { hash2, ridged, smoothstep } from '@/lib/event-noise';
import type { SceneState } from '@/lib/event-scene-state';

const ROWS = 38;
const Z_NEAR = 22;
const Z_GROWTH = 1.07;
const BG = '#040404';
const GROUND = '#070706';

/** Lattice spacing grows with distance so the mesh stays evenly dense on screen. */
function gridFor(z: number): number {
  if (z < 34) return 1;
  if (z < 80) return 2;
  if (z < 170) return 4;
  return 8;
}

function height(x: number, z: number): number {
  const n = ridged(x * 0.045 + 11.3, z * 0.045 + 3.7);
  const mask = smoothstep(34, 105, z); // flat ground near the camera
  const fade = 1 - smoothstep(210, 290, z) * 0.5;
  return Math.pow(n, 1.7) * 31 * mask * fade;
}

interface Row {
  xs: Float32Array;
  ys: Float32Array;
  i0: number;
  count: number;
  g: number;
}

const MAX_COLS = 140;
const makeRow = (): Row => ({
  xs: new Float32Array(MAX_COLS),
  ys: new Float32Array(MAX_COLS),
  i0: 0,
  count: 0,
  g: 1,
});

/**
 * Full-screen wireframe mountain range. The camera slides sideways with the
 * scroll position, so near rows move faster than far rows (parallax).
 */
export default function Terrain({ state }: { state: MutableRefObject<SceneState> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;

    const stars = Array.from({ length: 260 }, (_, i) => ({
      u: hash2(i, 1),
      v: hash2(i, 2),
      depth: 0.25 + hash2(i, 3) * 0.75,
      size: hash2(i, 4) > 0.93 ? 2 : 1,
      tw: hash2(i, 5) * 6.28,
    }));

    let near = makeRow();
    let far = makeRow();

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const s = state.current;
      const t = s.time;

      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      const horizon = h * 0.5;
      const zoom = 1.35 - 0.35 * s.intro; // slow push-out on load
      const f = Math.max(w * 0.8, h * 0.95) * zoom;
      const camX = s.cur * 16 + t * 0.35;
      const camY = 7 + Math.sin(t * 0.25) * 0.25;

      // warm haze on the horizon
      const haze = ctx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, w * 0.65);
      haze.addColorStop(0, 'rgba(120,88,40,0.2)');
      haze.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, w, h);

      // drifting dust / stars (parallax with scroll)
      for (const st of stars) {
        const x = (((st.u * w - s.cur * st.depth * 90 - t * st.depth * 3) % w) + w) % w;
        const y = st.v * horizon * 1.05;
        const a = (0.22 + 0.5 * st.depth) * (0.65 + 0.35 * Math.sin(t * 1.3 + st.tw)) * s.intro;
        ctx.fillStyle = `rgba(235,225,205,${a.toFixed(3)})`;
        ctx.fillRect(x, y, st.size, st.size);
      }

      ctx.globalAlpha = Math.min(1, s.intro * 1.15);
      ctx.lineWidth = 0.8;
      ctx.lineJoin = 'round';

      // far → near (painter's algorithm: each row hides what is behind it)
      let haveFar = false;
      for (let j = ROWS - 1; j >= 0; j--) {
        const z = Z_NEAR * Math.pow(Z_GROWTH, j);
        const g = gridFor(z);
        const halfW = (w / 2 / f) * z + g * 2;
        const i0 = Math.floor((camX - halfW) / g);
        const i1 = Math.ceil((camX + halfW) / g);
        const count = Math.min(MAX_COLS, i1 - i0 + 1);

        near.i0 = i0;
        near.count = count;
        near.g = g;
        const k = f / z;
        for (let c = 0; c < count; c++) {
          const wx = (i0 + c) * g;
          near.xs[c] = w / 2 + (wx - camX) * k;
          near.ys[c] = horizon + (camY - height(wx, z)) * k;
        }

        const depth01 = j / (ROWS - 1); // 0 near … 1 far
        const a = 0.04 + 0.2 * (1 - depth01 * 0.8);
        ctx.strokeStyle = `rgba(214,200,175,${a.toFixed(3)})`;

        // links to the next-farther row (drawn before this row's fill so hills can hide them)
        if (haveFar) {
          const ratio = Math.round(far.g / near.g);
          ctx.beginPath();
          for (let c = 0; c < near.count; c++) {
            const iw = near.i0 + c;
            if (iw % ratio !== 0) continue;
            const fc = iw / ratio - far.i0;
            if (fc < 0 || fc >= far.count) continue;
            ctx.moveTo(near.xs[c], near.ys[c]);
            ctx.lineTo(far.xs[fc], far.ys[fc]);
          }
          ctx.stroke();
        }

        // solid ground under this row
        ctx.beginPath();
        ctx.moveTo(near.xs[0], near.ys[0]);
        for (let c = 1; c < count; c++) ctx.lineTo(near.xs[c], near.ys[c]);
        ctx.lineTo(near.xs[count - 1], h + 2);
        ctx.lineTo(near.xs[0], h + 2);
        ctx.closePath();
        ctx.fillStyle = GROUND;
        ctx.fill();
        ctx.stroke();

        // dotted grid in the foreground
        if (j < 12) {
          ctx.fillStyle = `rgba(240,225,195,${(0.08 + 0.2 * (1 - depth01 * 2)).toFixed(3)})`;
          for (let c = 0; c < count; c++) ctx.fillRect(near.xs[c] - 0.75, near.ys[c] - 0.75, 1.5, 1.5);
        }

        const tmp = far;
        far = near;
        near = tmp;
        haveFar = true;
      }
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [state]);

  return <canvas ref={ref} className="ev-canvas" aria-hidden="true" />;
}
