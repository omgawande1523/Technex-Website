"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import styles from "./chrome.module.css";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, [data-cursor]";

/**
 * Ink-dot cursor that swells into a brush blob over interactive elements,
 * plus magnetic pull for anything marked `data-magnetic`.
 * Desktop only: needs a fine pointer with hover.
 */
export default function InkCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    if (!enabled || !dot) return;
    document.documentElement.classList.add(styles.hasInkCursor);
    const reduce = prefersReducedMotion();
    const xTo = gsap.quickTo(dot, "x", { duration: reduce ? 0 : 0.18, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: reduce ? 0 : 0.18, ease: "power3" });
    let magnet: HTMLElement | null = null;

    const release = () => {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target as Element | null;
      const hover = target?.closest?.(INTERACTIVE);
      dot.dataset.state = hover ? "blob" : "dot";
      const label = (hover as HTMLElement | null)?.dataset?.cursor;
      dot.dataset.label = label && label !== "true" ? label : "";

      const m = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) release();
      if (m && !reduce) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(m, { x: dx * 0.3, y: dy * 0.35, duration: 0.4, ease: "power3.out" });
      }
    };
    const onDown = () => (dot.dataset.pressed = "true");
    const onUp = () => (dot.dataset.pressed = "false");
    const onLeave = () => {
      dot.dataset.state = "hidden";
      release();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.documentElement.classList.remove(styles.hasInkCursor);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      release();
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={dotRef} className={styles.cursor} data-state="hidden" aria-hidden="true" />;
}
