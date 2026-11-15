"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./worlds.module.css";

/** Cards rise out of the ink in a stagger while the scene is pinned; the art draws itself once. */
export function useWorldsTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean }) {
  useGSAP(
    () => {
      if (opts.reduced) return;
      const q = gsap.utils.selector(scope);
      const tl = gsap.timeline({
        scrollTrigger: opts.mobile
          ? { trigger: scope.current, start: "top 75%", end: "top 15%", scrub: 0.6 }
          : { trigger: scope.current, start: "top top", end: "+=90%", pin: true, scrub: 0.7 },
      });
      tl.from(q(`.${styles.title}`), { yPercent: 60, opacity: 0, duration: 0.6 })
        .from(
          q(`.${styles.cell}`),
          { yPercent: 70, opacity: 0, rotate: (i: number) => (i % 2 ? 4 : -4), stagger: 0.18, duration: 1, ease: "power3.out" },
          0.1,
        )
        .fromTo(q("[data-draw]"), { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.04, duration: 1 }, 0.4);
    },
    { scope, dependencies: [opts.reduced, opts.mobile] },
  );
}
