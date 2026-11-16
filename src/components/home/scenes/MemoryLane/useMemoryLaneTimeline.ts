"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./memory-lane.module.css";

/**
 * Pinned horizontal scroll-jack: the two rows travel in opposite directions,
 * each polaroid with its own parallax (data-depth). The photo nearest the
 * centre line scales up and straightens. Mobile uses native swipe rows.
 */
export function useMemoryLaneTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean; ready: boolean }) {
  useGSAP(
    () => {
      if (opts.reduced || opts.mobile || !opts.ready) return;
      const q = gsap.utils.selector(scope);
      const rows = q(`.${styles.row}`) as HTMLElement[];
      if (!rows.length) return;
      const polaroids = q(`.${styles.polaroid}`) as HTMLElement[];
      const travel = () => Math.max(...rows.map((r) => r.scrollWidth - window.innerWidth)) + 120;

      const focus = () => {
        const mid = window.innerWidth / 2;
        let best: HTMLElement | null = null;
        let bestD = Infinity;
        polaroids.forEach((p) => {
          const r = p.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - mid);
          if (d < bestD && r.top > 0 && r.bottom < window.innerHeight) {
            bestD = d;
            best = p;
          }
        });
        polaroids.forEach((p) => (p.dataset.active = String(p === best)));
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: () => `+=${travel()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: focus,
        },
      });
      tl.fromTo(rows[0], { x: 0 }, { x: () => -(rows[0].scrollWidth - window.innerWidth + 80) }, 0);
      if (rows[1]) tl.fromTo(rows[1], { x: () => -(rows[1].scrollWidth - window.innerWidth + 80) }, { x: 0 }, 0);
      polaroids.forEach((p) => {
        const depth = Number(p.dataset.depth ?? 1);
        tl.fromTo(p, { xPercent: (depth - 1) * 60 }, { xPercent: (1 - depth) * 60 }, 0);
      });
    },
    { scope, dependencies: [opts.reduced, opts.mobile, opts.ready] },
  );
}
