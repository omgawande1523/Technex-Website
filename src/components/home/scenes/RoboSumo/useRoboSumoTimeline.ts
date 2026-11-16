"use client";

import type { RefObject } from "react";
import { numericParts } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./robo-sumo.module.css";

/**
 * Pinned: the ring inks itself, the bots roll in and collide; on impact the
 * title slams down with a camera shake and sparks, then the stats count up.
 */
export function useRoboSumoTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean }) {
  useGSAP(
    () => {
      if (opts.reduced) return;
      const q = gsap.utils.selector(scope);
      const counters = q("[data-count]") as HTMLElement[];

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope.current,
          start: opts.mobile ? "top 60%" : "top top",
          end: opts.mobile ? "bottom 80%" : "+=140%",
          pin: !opts.mobile,
          scrub: 0.5,
        },
      });

      tl.fromTo(q("[data-ring]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.25, stagger: 0.05 }, 0)
        .fromTo(q(`.${styles.botLeft}`), { x: -140 }, { x: 22, duration: 0.25, ease: "power2.in" }, 0.15)
        .fromTo(q(`.${styles.botRight}`), { x: 140 }, { x: -22, duration: 0.25, ease: "power2.in" }, 0.15)
        .fromTo(
          q(`.${styles.slam}`),
          { scale: 3.2, opacity: 0, yPercent: -40 },
          { scale: 1, opacity: 1, yPercent: 0, duration: 0.08, stagger: 0.04, ease: "power4.in" },
          0.32,
        )
        .fromTo(q(`.${styles.sparks}`), { scale: 0.2, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.6, opacity: 0, duration: 0.12 }, 0.4)
        .to(q(`.${styles.shake}`), { keyframes: { x: [0, -14, 12, -8, 6, -3, 0], y: [0, 8, -10, 6, -4, 2, 0] }, duration: 0.1, ease: "none" }, 0.4)
        .fromTo(q(`.${styles.enter}`), { opacity: 0, letterSpacing: "0.8em" }, { opacity: 1, letterSpacing: "0.3em", duration: 0.12 }, 0.48)
        .from(q(`.${styles.tagline}, .${styles.stat}, .${styles.ctas}`), { opacity: 0, y: 24, stagger: 0.03, duration: 0.1 }, 0.52);

      counters.forEach((el, i) => {
        const parts = numericParts(el.dataset.format ?? "");
        if (!parts) return;
        const o = { v: 0 };
        el.textContent = parts.format(0);
        tl.to(o, { v: parts.value, duration: 0.25, ease: "power2.out", onUpdate: () => (el.textContent = parts.format(o.v)) }, 0.56 + i * 0.03);
      });
    },
    { scope, dependencies: [opts.reduced, opts.mobile] },
  );
}
