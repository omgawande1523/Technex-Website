/**
 * Glowing gold wireframe "objects" shown inside each event frame.
 *
 * Every object is a set of closed 3D polylines (unit radius). It is drawn many
 * times with slightly different rotations ("copies") and additive blending –
 * that stacked-ribbon look is what gives the shapes their light-trail feel.
 */
export type V3 = readonly [number, number, number];
export type ShapeKind = 'star' | 'triangle' | 'chevron' | 'ring' | 'rosette' | 'hex';

export interface Pose {
  ax: number;
  ay: number;
  az: number;
  sc: number;
}

export interface ShapeDef {
  lines: V3[][];
  copies: number;
  /** draw glowing dots on the vertices of the brightest copy */
  markers: boolean;
  /**
   * time   – seconds
   * p      – 0 (oldest/faintest copy) … 1 (newest/brightest copy)
   * spread – how far the copies fan out (grows while scrolling fast)
   * d      – signed distance of this frame from the centre (index - cur)
   */
  pose: (time: number, p: number, spread: number, d: number) => Pose;
}

const TAU = Math.PI * 2;

function polygon(sides: number, r: number, rot = 0): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i <= sides; i++) {
    const a = rot + (i / sides) * TAU;
    pts.push([Math.cos(a) * r, Math.sin(a) * r, 0]);
  }
  return pts;
}

function star(points: number, outer: number, inner: number, rot = 0): V3[] {
  const pts: V3[] = [];
  const n = points * 2;
  for (let i = 0; i <= n; i++) {
    const a = rot + (i / n) * TAU;
    const r = i % 2 === 0 ? outer : inner;
    pts.push([Math.cos(a) * r, Math.sin(a) * r, 0]);
  }
  return pts;
}

export const SHAPES: Record<ShapeKind, ShapeDef> = {
  star: {
    lines: [star(4, 1, 0.42, -Math.PI / 2), polygon(6, 0.5)],
    copies: 16,
    markers: true,
    pose: (time, p, spread, d) => ({
      ax: Math.cos(time * 0.5) * 0.35 + d * 0.2,
      ay: Math.sin(time * 0.7) * 0.7 - d * 0.5 + p * spread * 0.9,
      az: time * 0.35 + p * spread * 0.8,
      sc: 1 - (1 - p) * 0.05,
    }),
  },

  triangle: {
    lines: [polygon(3, 1, -Math.PI / 2), polygon(3, 0.52, -Math.PI / 2)],
    copies: 15,
    markers: true,
    pose: (time, p, spread, d) => ({
      ax: 0.35 + d * 0.1,
      ay: time * 0.8 + p * spread * 2.4 - d * 0.6,
      az: time * 0.25 + p * spread * 0.5,
      sc: 1,
    }),
  },

  chevron: {
    lines: [
      [
        [0, 1, 0],
        [0.85, -0.9, 0],
        [0, -0.35, 0],
        [-0.85, -0.9, 0],
        [0, 1, 0],
      ],
    ],
    copies: 15,
    markers: true,
    pose: (time, p, spread, d) => ({
      ax: 0.25 + p * spread * 0.4,
      ay: Math.sin(time * 0.6) * 0.9 + p * spread * 1.5 - d * 0.6,
      az: -0.35 + p * spread * 0.3,
      sc: 1,
    }),
  },

  ring: {
    lines: [polygon(72, 1)],
    copies: 18,
    markers: false,
    pose: (time, p, spread, d) => ({
      ax: time * 0.3 + (p - 0.5) * spread * 2.4,
      ay: 0.5 + Math.sin(time * 0.4) * 0.3 - d * 0.5,
      az: (p - 0.5) * spread * 0.5,
      sc: 1,
    }),
  },

  rosette: {
    lines: [polygon(72, 1)],
    copies: 22,
    markers: false,
    pose: (time, p, _spread, d) => ({
      ax: p * Math.PI * 0.95 + time * 0.12,
      ay: time * 0.35 - d * 0.4,
      az: p * 0.5 + time * 0.1,
      sc: 0.92,
    }),
  },

  hex: {
    lines: [polygon(6, 1), polygon(6, 0.62, Math.PI / 6)],
    copies: 14,
    markers: true,
    pose: (time, p, spread, d) => ({
      ax: time * 0.4 + p * spread * 1.1,
      ay: time * 0.55 + p * spread * 1.5 - d * 0.5,
      az: p * spread * 0.3,
      sc: 1,
    }),
  },
};
