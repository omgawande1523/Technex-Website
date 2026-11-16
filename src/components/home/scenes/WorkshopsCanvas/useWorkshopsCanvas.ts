"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./workshops-canvas.module.css";

export interface CanvasItem {
  id: string;
  name: string;
  kind: "Workshop" | "Competition";
  category: string;
  image: string;
  href: string;
  days: number[];
}
type Placed = CanvasItem & { x: number; y: number; r: number; size: number };

const TILE_W = 1800;
const TILE_H = 1100;

/** Deterministic scatter of items over one tile (jittered grid). */
function place(items: CanvasItem[]): Placed[] {
  const cols = Math.max(3, Math.ceil(Math.sqrt(items.length * 1.6)));
  const rows = Math.ceil(items.length / cols);
  const cw = TILE_W / cols;
  const ch = TILE_H / Math.max(rows, 1);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return items.map((it, i) => ({
    ...it,
    x: (i % cols) * cw + rnd() * cw * 0.35,
    y: Math.floor(i / cols) * ch + ch * 0.25 + rnd() * ch * 0.3,
    r: (rnd() - 0.5) * 8,
    size: 30 + rnd() * 26,
  }));
}

/**
 * Infinite pan: a 3×3 grid of identical tiles; the offset wraps modulo the
 * tile size so the canvas never ends. Drag with inertia, arrow keys pan.
 * Hovering a name shows its image, skewed and stretched by pointer velocity.
 */
export function useWorkshopsCanvas(
  scope: RefObject<HTMLElement | null>,
  items: CanvasItem[],
  opts: { reduced: boolean; mobile: boolean },
) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });

  const placed = useMemo(() => place(items), [items]);
  const tiles = useMemo(
    () =>
      [-1, 0, 1].flatMap((ty) =>
        [-1, 0, 1].map((tx) => ({
          key: `${tx}:${ty}`,
          items: placed.map((p) => ({ ...p, x: p.x + tx * TILE_W, y: p.y + ty * TILE_H })),
        })),
      ),
    [placed],
  );

  // Drag + inertia + keyboard.
  useEffect(() => {
    const vp = viewportRef.current;
    const world = worldRef.current;
    if (!vp || !world || opts.mobile) return;
    const pan = panRef.current;
    let vx = 0;
    let vy = 0;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    const apply = () => {
      const wx = ((pan.x % TILE_W) + TILE_W) % TILE_W;
      const wy = ((pan.y % TILE_H) + TILE_H) % TILE_H;
      world.style.transform = `translate3d(${wx - TILE_W + vp.clientWidth / 2 - TILE_W / 2}px, ${wy - TILE_H + vp.clientHeight / 2 - TILE_H / 2}px, 0)`;
    };
    const glide = () => {
      if (!dragging) {
        pan.x += vx;
        pan.y += vy;
        vx *= 0.93;
        vy *= 0.93;
        apply();
        if (Math.abs(vx) + Math.abs(vy) < 0.05) return;
      }
      raf = requestAnimationFrame(glide);
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      vx = vy = 0;
      vp.setPointerCapture(e.pointerId);
      vp.dataset.dragging = "true";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(glide);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      pan.x += dx;
      pan.y += dy;
      vx = opts.reduced ? 0 : dx;
      vy = opts.reduced ? 0 : dy;
      apply();
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      vp.dataset.dragging = "false";
      // Tell global click handlers (the ink route wipe) that this was a drag.
      if (moved > 6) {
        vp.dataset.suppressClick = "true";
        window.setTimeout(() => (vp.dataset.suppressClick = "false"), 0);
      }
      if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
    };
    // A drag must not turn into a click on the name under the pointer.
    const click = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const key = (e: KeyboardEvent) => {
      const d = 60;
      const map: Record<string, [number, number]> = { ArrowLeft: [d, 0], ArrowRight: [-d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] };
      const m = map[e.key];
      if (!m || e.target !== vp) return;
      e.preventDefault();
      gsap.to(pan, { x: pan.x + m[0], y: pan.y + m[1], duration: opts.reduced ? 0 : 0.4, ease: "power2.out", onUpdate: apply });
    };
    apply();
    vp.addEventListener("pointerdown", down);
    vp.addEventListener("pointermove", move);
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointercancel", up);
    vp.addEventListener("click", click, true);
    vp.addEventListener("keydown", key);
    window.addEventListener("resize", apply);
    return () => {
      cancelAnimationFrame(raf);
      vp.removeEventListener("pointerdown", down);
      vp.removeEventListener("pointermove", move);
      vp.removeEventListener("pointerup", up);
      vp.removeEventListener("pointercancel", up);
      vp.removeEventListener("click", click, true);
      vp.removeEventListener("keydown", key);
      window.removeEventListener("resize", apply);
    };
  }, [opts.mobile, opts.reduced, tiles]);

  // Preview follows the pointer; skew/stretch from velocity.
  useEffect(() => {
    const vp = viewportRef.current;
    const pv = previewRef.current;
    if (!vp || !pv || opts.mobile) return;
    const xTo = gsap.quickTo(pv, "x", { duration: opts.reduced ? 0 : 0.35, ease: "power3" });
    const yTo = gsap.quickTo(pv, "y", { duration: opts.reduced ? 0 : 0.35, ease: "power3" });
    let lx = 0;
    let lt = performance.now();
    const move = (e: PointerEvent) => {
      const r = vp.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      xTo(x);
      yTo(y);
      const now = performance.now();
      const v = (x - lx) / Math.max(8, now - lt);
      lx = x;
      lt = now;
      if (!opts.reduced) {
        gsap.to(pv, { skewX: gsap.utils.clamp(-22, 22, -v * 14), scaleY: 1 + Math.min(0.25, Math.abs(v) * 0.18), duration: 0.3, overwrite: "auto" });
        gsap.to(pv, { skewX: 0, scaleY: 1, duration: 0.6, delay: 0.12, overwrite: false });
      }
    };
    vp.addEventListener("pointermove", move);
    return () => vp.removeEventListener("pointermove", move);
  }, [opts.mobile, opts.reduced]);

  const onEnterItem = (it: CanvasItem) => {
    const pv = previewRef.current;
    if (!pv) return;
    const img = pv.querySelector("img");
    const label = pv.querySelector("span");
    if (img && img.getAttribute("src") !== it.image) img.setAttribute("src", it.image);
    if (label) label.textContent = `${it.kind} · ${it.category}`;
    gsap.to(pv, { autoAlpha: 1, scale: 1, duration: opts.reduced ? 0 : 0.35, ease: "power3.out" });
  };
  const onLeaveItem = () => {
    const pv = previewRef.current;
    if (pv) gsap.to(pv, { autoAlpha: 0, scale: 0.85, duration: opts.reduced ? 0 : 0.25 });
  };

  // Intro: pinned briefly while names ink in.
  useGSAP(
    () => {
      if (opts.reduced) return;
      const q = gsap.utils.selector(scope);
      gsap
        .timeline({
          scrollTrigger: opts.mobile
            ? { trigger: scope.current, start: "top 70%", end: "top 20%", scrub: 0.5 }
            : { trigger: scope.current, start: "top top", end: "+=50%", pin: true, scrub: 0.5 },
        })
        .from(q(`.${styles.title}`), { yPercent: 50, opacity: 0, duration: 0.4 })
        .from(q(`.${styles.name}, .${styles.stripItem}`), { opacity: 0, y: 30, filter: "blur(6px)", stagger: { amount: 0.6, from: "random" }, duration: 0.4 }, 0.1);
    },
    { scope, dependencies: [opts.reduced, opts.mobile, tiles] },
  );

  return { viewportRef, worldRef, panRef, previewRef, onEnterItem, onLeaveItem, tiles };
}
