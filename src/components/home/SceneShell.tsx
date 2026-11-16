"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type Props = {
  id: string;
  hud: string;
  /** Height reserved before the scene mounts, so the page does not jump. */
  placeholderHeight?: string;
  /** Mount immediately (first scene). */
  eager?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Lazy-mounts a scene when it comes within ~1.5 viewports, then asks
 * ScrollTrigger to re-measure so pins below stay correct.
 * `data-hud` names the scene in the HUD pill.
 */
export default function SceneShell({ id, hud, placeholderHeight = "100svh", eager, className, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(!!eager);

  useEffect(() => {
    if (mounted) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  // Scene code arrives as its own chunk, so its height (and pins) settle a
  // moment after mounting. Re-measure ScrollTrigger whenever it changes.
  useEffect(() => {
    const el = ref.current;
    if (!mounted || !el) return;
    let last = el.offsetHeight;
    let timer: number | undefined;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (Math.abs(h - last) < 2) return;
      last = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    ro.observe(el);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(id);
    };
  }, [mounted]);

  return (
    <section
      ref={ref}
      id={id}
      data-hud={hud}
      className={className}
      style={mounted ? undefined : { minHeight: placeholderHeight }}
    >
      {mounted ? children : null}
    </section>
  );
}
