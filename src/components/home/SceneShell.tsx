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

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
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
