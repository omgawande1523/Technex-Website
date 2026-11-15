"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./portal.module.css";

/**
 * Pinned, scrubbed: the frame slides in from the right, settles, then scales
 * past the viewport while the outside blurs away, so the camera "flies
 * through" into the next world. Mobile: shorter pin, no blur filters.
 */
export function usePortalTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean }) {
  useGSAP(
    () => {
      if (opts.reduced) return;
      const q = gsap.utils.selector(scope);
      const frame = q(`.${styles.frame}`);
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: opts.mobile ? "+=110%" : "+=180%",
          pin: true,
          scrub: 0.8,
        },
      });
      tl.fromTo(frame, { xPercent: 140, rotate: -9, scale: 0.42 }, { xPercent: 0, rotate: 0, scale: 0.5, ease: "power2.out", duration: 1 })
        .fromTo(q(`.${styles.windowTitle}`), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.6)
        .to(frame, { scale: opts.mobile ? 5 : 7, duration: 1.6, ease: "power2.in" }, 1.15)
        .to(q(`.${styles.windowTitle}, .${styles.windowKicker}`), { opacity: 0, duration: 0.5 }, 1.6)
        .to(q(`.${styles.edge}`), { opacity: 0, duration: 0.6 }, 2.0)
        .to(q(`.${styles.bgWord}`), { opacity: 0, scale: 1.3, ...(opts.mobile ? {} : { filter: "blur(18px)" }), duration: 1.4 }, 0.9);
      if (!opts.mobile) {
        tl.fromTo(q(`.${styles.edge}`), { filter: "blur(0px)" }, { filter: "blur(6px)", duration: 1 }, 1.4);
      }
    },
    { scope, dependencies: [opts.reduced, opts.mobile] },
  );
}
