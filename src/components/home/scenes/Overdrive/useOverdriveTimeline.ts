"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { FrameSequence } from "./frameSequence";
import styles from "./overdrive.module.css";

/**
 * Pinned full-screen cinema. Scroll position picks the frame (forward and
 * back, Apple-style) and types the spec sheet out character by character.
 */
export function useOverdriveTimeline(
  scope: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  opts: { reduced: boolean; mobile: boolean; sequence: FrameSequence | null },
) {
  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const seq = opts.sequence;
      if (!canvas || !seq) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const q = gsap.utils.selector(scope);
      const total = seq.length;
      const state = { frame: opts.reduced ? Math.floor(total / 2) : 0 };

      const size = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2);
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        render();
      };
      const render = () => {
        ctx.fillStyle = "#0b0906";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        seq.draw(ctx, Math.round(state.frame), canvas.width, canvas.height);
      };
      size();
      window.addEventListener("resize", size);
      // Keep painting while frames stream in until the first real frame lands.
      const warm = window.setInterval(render, 250);
      window.setTimeout(() => window.clearInterval(warm), 6000);

      const typed = q("[data-type]") as HTMLElement[];
      if (opts.reduced) {
        typed.forEach((el) => (el.textContent = el.dataset.type ?? ""));
        return () => {
          window.removeEventListener("resize", size);
          window.clearInterval(warm);
        };
      }
      const full = typed.map((el) => el.dataset.type ?? "");
      const totalChars = full.reduce((n, s) => n + s.length, 0);
      const type = (p: number) => {
        let budget = Math.round(p * totalChars);
        typed.forEach((el, i) => {
          const take = Math.max(0, Math.min(full[i].length, budget));
          budget -= take;
          el.textContent = full[i].slice(0, take) + (take > 0 && take < full[i].length ? "▌" : "");
        });
      };
      type(0);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: opts.mobile ? "+=200%" : "+=320%",
          pin: true,
          scrub: 0.4,
        },
      });
      tl.to(state, { frame: total - 1, duration: 1, onUpdate: render }, 0)
        .fromTo(q(`.${styles.titleBlock}`), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.12 }, 0.02)
        .fromTo(q(`.${styles.sheet}`), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.1 }, 0.08)
        .to({ p: 0 }, { p: 1, duration: 0.55, onUpdate() { type(this.targets()[0].p); } }, 0.12)
        .to(q(`.${styles.chip}`), { opacity: 0, duration: 0.08 }, 0.3)
        .to(q(`.${styles.titleBlock}, .${styles.sheet}`), { opacity: 0, y: -30, duration: 0.1 }, 0.9);

      return () => {
        window.removeEventListener("resize", size);
        window.clearInterval(warm);
      };
    },
    { scope, dependencies: [opts.reduced, opts.mobile, opts.sequence] },
  );
}
