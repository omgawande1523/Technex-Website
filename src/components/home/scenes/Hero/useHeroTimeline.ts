"use client";

import type { RefObject } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import styles from "./hero.module.css";

/**
 * Intro: the wordmark is inked in left to right, tagline letters bleed in.
 * Scroll: the hero pins briefly while the wordmark swells and the copy lifts
 * away, handing over to the portal. Reduced motion: no animation at all.
 */
export function useHeroTimeline(scope: RefObject<HTMLElement | null>, opts: { reduced: boolean; mobile: boolean; start: boolean }) {
  useGSAP(
    () => {
      if (opts.reduced || !opts.start) return;
      const q = gsap.utils.selector(scope);
      const split = SplitText.create(q(`.${styles.tagline}`), { type: "chars,words", charsClass: styles.char });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(q(`.${styles.wordmark}`), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.6, ease: "power2.inOut" })
        .from(
          split.chars,
          { opacity: 0, yPercent: 70, scaleY: 1.6, filter: "blur(10px)", duration: 0.9, stagger: 0.022 },
          "-=0.9",
        )
        .from(q(`.${styles.side} > *`), { opacity: 0, x: 24, duration: 0.8, stagger: 0.1 }, "<0.2")
        .from(q(`.${styles.bottom} > *`), { opacity: 0, y: 26, duration: 0.8, stagger: 0.12 }, "<0.1");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: opts.mobile ? "bottom top" : "+=70%",
          pin: !opts.mobile,
          scrub: 0.6,
        },
      });
      scrollTl
        .to(q(`.${styles.wordmark}`), { scale: 1.18, yPercent: -18, ease: "none" }, 0)
        .to(q(`.${styles.copy}`), { opacity: 0, y: -60, ease: "none" }, 0)
        .to(q(`.${styles.canvas}`), { scale: 1.25, opacity: 0.35, ease: "none" }, 0);

      return () => {
        split.revert();
        ScrollTrigger.refresh();
      };
    },
    { scope, dependencies: [opts.reduced, opts.mobile, opts.start] },
  );
}
