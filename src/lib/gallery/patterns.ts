import type { GalleryMedia } from "@/lib/types";

export type PatternDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
) => void;

const INK = "#070603";

export type PatternKey = "deep" | "cells" | "flux" | "scan" | "moire";

export const PATTERN_TITLES: Record<PatternKey, string> = {
  deep: "DEEP SET",
  cells: "CELL DRIFT",
  flux: "FLUX FIELD",
  scan: "SCAN LINES",
  moire: "MOIRE 07",
};

export const PATTERN_ORDER: PatternKey[] = [
  "deep",
  "cells",
  "flux",
  "scan",
  "moire",
];

function bg(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(
    w / 2,
    h * 0.45,
    0,
    w / 2,
    h * 0.45,
    Math.hypot(w, h) * 0.55,
  );
  g.addColorStop(0, "rgba(255,220,120,0.10)");
  g.addColorStop(1, "rgba(255,220,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export const PATTERNS: Record<PatternKey, PatternDraw> = {
  deep(ctx, w, h, t) {
    bg(ctx, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.hypot(w, h) * 0.62;
    for (let i = 0; i < 26; i++) {
      const p = (((i / 26 + t * 0.06) % 1) + 1) % 1;
      ctx.beginPath();
      ctx.arc(cx, cy, p * R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,220,120,${0.55 * (1 - p)})`;
      ctx.lineWidth = 1 + (1 - p) * 2.6;
      ctx.stroke();
    }
  },
  cells(ctx, w, h, t) {
    bg(ctx, w, h);
    const n = 16;
    const cw = w / n;
    const ch = h / n;
    const m = cw * 0.16;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v =
          0.5 +
          0.5 *
            Math.sin(
              x * 0.9 + y * 0.6 + t * 1.3 + Math.sin(y * 1.7 - t * 0.6) * 1.2,
            );
        if (v < 0.5) continue;
        ctx.fillStyle = `rgba(230,195,92,${((v - 0.5) / 0.5) * 0.72})`;
        ctx.fillRect(x * cw + m, y * ch + m, cw - m * 2, ch - m * 2);
      }
    }
  },
  flux(ctx, w, h, t) {
    bg(ctx, w, h);
    ctx.lineWidth = 2;
    for (let i = 0; i < 44; i++) {
      const y0 = (i / 44) * h;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 16) {
        const y =
          y0 +
          Math.sin(x * 0.012 + t * 0.9 + i * 0.32) * 14 +
          Math.sin(x * 0.03 - t * 0.5) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,220,120,${
        0.16 + 0.26 * (0.5 + 0.5 * Math.sin(i * 0.5 + t))
      })`;
      ctx.stroke();
    }
  },
  scan(ctx, w, h, t) {
    bg(ctx, w, h);
    const sweep = ((((t * 0.18) % 1) + 1) % 1) * h;
    for (let y = 0; y < h; y += 4) {
      const d = Math.abs(y - sweep) / (h * 0.28);
      ctx.fillStyle = `rgba(230,195,92,${0.1 + 0.6 * Math.max(0, 1 - d)})`;
      ctx.fillRect(0, y, w, 1.6);
    }
    ctx.fillStyle = "rgba(255,220,120,0.14)";
    ctx.fillRect(0, sweep - 2, w, 4);
  },
  moire(ctx, w, h, t) {
    bg(ctx, w, h);
    ctx.globalCompositeOperation = "lighter";
    const R = Math.hypot(w, h);
    for (let k = 0; k < 2; k++) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((k ? -1 : 1) * (0.06 + 0.05 * Math.sin(t * 0.35 + k)));
      ctx.strokeStyle = k ? "rgba(255,220,120,0.34)" : "rgba(230,195,92,0.34)";
      ctx.lineWidth = 2;
      for (let x = -R / 2; x < R / 2; x += 9) {
        ctx.beginPath();
        ctx.moveTo(x, -R / 2);
        ctx.lineTo(x, R / 2);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";
  },
};

/** Helper for building loop media entries. */
export function loopMedia(key: PatternKey): GalleryMedia {
  return { type: "loop", src: `gen:${key}`, title: PATTERN_TITLES[key] };
}
