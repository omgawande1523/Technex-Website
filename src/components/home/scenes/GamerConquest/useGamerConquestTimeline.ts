"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import styles from "./gamer-conquest.module.css";

/**
 * Pinned on desktop. 0–35%: the CRT powers on (line expands, flicker).
 * 35–78%: hold so the game can be played. 78–100%: if the visitor keeps
 * scrolling, LEVEL COMPLETE appears and its loading bar fills with scroll —
 * that bar is the hand-off into Overdrive.
 */
export function useGamerConquestTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean }) {
  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      const screen = q(`.${styles.screenOn}`);
      const line = q(`.${styles.powerLine}`);
      const complete = q(`.${styles.complete}`)[0] as HTMLElement | undefined;
      const fill = q(`.${styles.loadFill}`)[0] as HTMLElement | undefined;

      if (opts.reduced) {
        gsap.set(screen, { clipPath: "inset(0% 0% 0% 0%)", filter: "none" });
        gsap.set(line, { autoAlpha: 0 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope.current,
          start: opts.mobile ? "top 70%" : "top top",
          end: opts.mobile ? "top 10%" : "+=170%",
          pin: !opts.mobile,
          scrub: 0.5,
          onUpdate: (self) => {
            if (opts.mobile || !complete || !fill) return;
            const p = (self.progress - 0.78) / 0.2;
            const show = p > 0 && complete.dataset.show !== "true";
            complete.dataset.scrollShow = String(show);
            if (show) fill.style.transform = `scaleX(${Math.min(1, p)})`;
          },
        },
      });

      tl.from(q(`.${styles.tv}`), { yPercent: 18, rotate: -3, opacity: 0, duration: 0.12 }, 0)
        .from(q(`.${styles.info} > *`), { opacity: 0, x: -40, stagger: 0.02, duration: 0.12 }, 0.02)
        .fromTo(line, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.08 }, 0.12)
        .fromTo(screen, { clipPath: "inset(49.6% 0% 49.6% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.1 }, 0.2)
        .to(line, { autoAlpha: 0, duration: 0.02 }, 0.22)
        .fromTo(screen, { filter: "brightness(2.4) contrast(1.4)" }, { filter: "brightness(1) contrast(1)", duration: 0.1, ease: "steps(8)" }, 0.24)
        .to({}, { duration: 0.65 }, 0.35);
    },
    { scope, dependencies: [opts.reduced, opts.mobile] },
  );
}
