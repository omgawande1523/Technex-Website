"use client";

/**
 * Realm state. Per-frame values live in the mutable `realm` object (read inside
 * useFrame, never through React state); low-frequency values (chapter, phase,
 * hovered event) are exposed through a tiny subscribe API for the HTML layer.
 */
import { useSyncExternalStore } from "react";

export const CHAPTERS = [
  { id: "gate", label: "The Gate", caption: "Imagination turning into reality." },
  { id: "realm", label: "INKARNATE", caption: "Where imagination becomes real." },
  { id: "events", label: "Events", caption: "Selected events. Built to leave a mark." },
  { id: "workshops", label: "Workshops", caption: "Learn from the people who build." },
  { id: "register", label: "Register", caption: "Your idea. Made real." },
] as const;

export const LAST = CHAPTERS.length - 1;

export type Phase = "loading" | "intro" | "dive" | "ready";

export const realm = {
  /** Eased chapter position, 0 … LAST (fractional while travelling). */
  progress: 0,
  /** 0 → 1 while the camera dives in after the intro. */
  dive: 0,
  /** Pointer in -1 … 1. */
  pointer: { x: 0, y: 0 },
  /** Signed travel speed in chapters / second (for effects). */
  velocity: 0,
  quality: 1 as 0 | 1 | 2,
};

type UiState = { chapter: number; phase: Phase; hovered: string | null; loaded: number };
let ui: UiState = { chapter: 0, phase: "loading", hovered: null, loaded: 0 };
const listeners = new Set<() => void>();

export function setUi(patch: Partial<UiState>) {
  ui = { ...ui, ...patch };
  listeners.forEach((l) => l());
}
export const getUi = () => ui;

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const SERVER: UiState = { chapter: 0, phase: "loading", hovered: null, loaded: 0 };
export function useUi() {
  return useSyncExternalStore(subscribe, getUi, () => SERVER);
}

/* ---------------------------------------------------------------- helpers */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
/** 0 → 1 → 0 bump centred on `c` with half-width `w` (in chapters). */
export const near = (p: number, c: number, w = 0.65) => smooth(clamp(1 - Math.abs(p - c) / w));
/** Piecewise-linear lookup: stops = [[progress, value], …]. */
export function along(p: number, stops: [number, number][]) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    const [p1, v1] = stops[i];
    const [p0, v0] = stops[i - 1];
    if (p <= p1) return v0 + (v1 - v0) * smooth((p - p0) / (p1 - p0));
  }
  return stops[stops.length - 1][1];
}
