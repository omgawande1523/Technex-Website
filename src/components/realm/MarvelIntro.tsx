"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import { realm, setUi } from "./store";
import styles from "./realm.module.css";

const SEEN_KEY = "tnx-realm-intro";

/**
 * Studio-style opening: a rapid page-flip montage of TECHNEX imagery that
 * collapses into a gold TECHNEX | 26 | block, then dives into the 3D gate.
 * Runs once per session; afterwards a short logo-only version plays.
 */
export default function MarvelIntro({ images, worldReady, edition }: { images: string[]; worldReady: boolean; edition: string }) {
  const root = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const { progress: loadPct } = useProgress();
  const shown = useRef({ v: 0 });
  const pctEl = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // smooth loading counter
  useEffect(() => {
    const target = worldReady ? 100 : Math.min(96, loadPct);
    gsap.to(shown.current, {
      v: target,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (pctEl.current) pctEl.current.textContent = String(Math.round(shown.current.v)).padStart(2, "0");
      },
    });
  }, [loadPct, worldReady]);

  // preload montage images
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    if (!worldReady || started.current) return;
    started.current = true;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(stack.current?.children ?? []) as HTMLElement[];
    const t = gsap.timeline({ delay: 0.25 });
    tl.current = t;
    setUi({ phase: "intro" });

    t.to(`.${styles.loadRow}`, { autoAlpha: 0, y: -10, duration: 0.4, ease: "power2.in" });

    if (!seen && !reduce && cards.length) {
      // flip montage, accelerating
      const flips = 26;
      let at = 0.35;
      for (let i = 0; i < flips; i++) {
        const c = cards[i % cards.length];
        const dur = Math.max(0.06, 0.22 * Math.pow(0.9, i));
        t.set(c, { zIndex: i + 2, autoAlpha: 1 }, at);
        t.fromTo(
          c,
          { rotationY: -96, scale: 1.18, filter: "blur(6px) brightness(1.4)" },
          { rotationY: 0, scale: 1, filter: "blur(0px) brightness(1)", duration: dur * 1.4, ease: "power2.out" },
          at,
        );
        at += dur;
      }
      t.addLabel("collapse", at);
      // the stack shrinks into the logo block
      t.to(stack.current, { clipPath: "inset(38% 20% 38% 20% round 4px)", duration: 0.55, ease: "power4.inOut" }, "collapse");
      t.to(`.${styles.tint}`, { opacity: 0.92, duration: 0.55, ease: "power2.inOut" }, "collapse");
      t.fromTo(logo.current, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out" }, "collapse+=0.35");
      t.to(stack.current, { autoAlpha: 0, duration: 0.3 }, "collapse+=0.6");
    } else {
      t.fromTo(logo.current, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0.3);
    }
    t.fromTo(`.${styles.logoSub}`, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12 }, ">-0.1");
    t.to({}, { duration: seen ? 0.6 : 1.1 });
    // dive into the world
    t.addLabel("dive");
    t.call(() => setUi({ phase: "dive" }), [], "dive");
    t.to(logo.current, { scale: 7, autoAlpha: 0, duration: 1.3, ease: "power3.in" }, "dive");
    t.to(root.current, { backgroundColor: "rgba(0,0,0,0)", duration: 1.1, ease: "power2.inOut" }, "dive+=0.25");
    t.to(realm, { dive: 1, duration: reduce ? 0.01 : 2.6, ease: "power3.inOut" }, "dive");
    t.call(
      () => {
        setUi({ phase: "ready" });
        setDone(true);
      },
      [],
      "dive+=2.2",
    );
    return () => {
      t.kill();
    };
  }, [worldReady]);

  const skip = () => {
    const t = tl.current;
    if (!t) return;
    const d = t.labels.dive;
    if (d !== undefined && t.time() < d) t.seek(d);
  };

  if (done) return null;
  return (
    <div ref={root} className={styles.intro} aria-label="Loading TECHNEX" role="status">
      <div ref={stack} className={styles.stack} aria-hidden>
        {images.map((src, i) => (
          <div key={i} className={styles.card} style={{ backgroundImage: `url("${src}")` }} />
        ))}
        <div className={styles.tint} />
      </div>

      <div ref={logo} className={styles.logo} aria-hidden>
        <div className={styles.logoBlock}>
          <span>TECHNEX</span>
        </div>
        <div className={`${styles.logoSub} ${styles.logoBars}`}>
          <i />
          <b>{edition}</b>
          <i />
        </div>
        <div className={`${styles.logoSub} ${styles.logoEdition}`}>20TH EDITION · INKARNATE</div>
      </div>

      <div className={styles.loadRow}>
        <span className={styles.loadName}>TECHNEX</span>
        <span className={styles.loadPct}>
          <span ref={pctEl}>00</span>
        </span>
      </div>

      {worldReady && (
        <button type="button" className={styles.skip} onClick={skip}>
          Skip intro
        </button>
      )}
    </div>
  );
}

export function resetDive() {
  realm.dive = 0;
}
