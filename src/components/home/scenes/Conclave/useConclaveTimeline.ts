"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import styles from "./conclave.module.css";

/** The vertical title stays pinned beside the speaker column while it scrolls; cards ink in. */
export function useConclaveTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean }) {
  useGSAP(
    () => {
      if (opts.reduced) return;
      const q = gsap.utils.selector(scope);
      if (!opts.mobile) {
        ScrollTrigger.create({
          trigger: scope.current,
          start: "top top",
          end: "bottom bottom",
          pin: q(`.${styles.side}`)[0],
          pinSpacing: false,
        });
      }
      gsap.from(q(`.${styles.vertical}`), {
        yPercent: 30,
        opacity: 0,
        filter: "blur(10px)",
        scrollTrigger: { trigger: scope.current, start: "top 70%", end: "top 20%", scrub: 0.6 },
      });
      q(`.${styles.card}`).forEach((card: Element, i: number) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          clipPath: "inset(100% 0 0 0)",
          duration: 0.9,
          delay: (i % 3) * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        });
      });
    },
    { scope, dependencies: [opts.reduced, opts.mobile] },
  );
}
