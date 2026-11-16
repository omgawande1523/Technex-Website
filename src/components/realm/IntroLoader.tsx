"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import { realm, setUi } from "./store";
import styles from "./realm.module.css";

const SEEN_KEY = "tnx-realm-intro";

/**
 * The TECHNEX opening, rendered in Blender (assets-src/intro): it plays full
 * screen while the 3D world loads, ends on the gold TECHNEX 26 logo, then the
 * camera dives through the logo into the gate. Returning visitors in the same
 * session get the logo frame only.
 */
export default function IntroLoader({ worldReady }: { worldReady: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);
  const [videoDone, setVideoDone] = useState(false);
  const [seen, setSeen] = useState<boolean | null>(null);
  const [gone, setGone] = useState(false);
  const { progress } = useProgress();
  const shown = useRef({ v: 0 });
  const dived = useRef(false);

  useEffect(() => {
    let s = false;
    try {
      s = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of sessionStorage on mount
    setSeen(s || reduce);
    setUi({ phase: "intro" });
  }, []);

  // play the film (muted autoplay is allowed everywhere)
  useEffect(() => {
    if (seen === null) return;
    if (seen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- skip straight to the logo frame
      setVideoDone(true);
      return;
    }
    const v = video.current;
    if (!v) return;
    v.play().catch(() => setVideoDone(true));
  }, [seen]);

  // loading counter
  useEffect(() => {
    gsap.to(shown.current, {
      v: worldReady ? 100 : Math.min(97, progress),
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (pctEl.current) pctEl.current.textContent = String(Math.round(shown.current.v)).padStart(2, "0");
      },
    });
  }, [progress, worldReady]);

  // film finished + world ready → dive
  useEffect(() => {
    if (!videoDone || !worldReady || dived.current) return;
    dived.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({ delay: seen ? 0.6 : 0.15 });
    tl.call(() => setUi({ phase: "dive" }));
    tl.to(`.${styles.introBar}`, { autoAlpha: 0, duration: 0.4 }, 0);
    // push through the logo: scale the last frame up while the world fades in
    tl.to([video.current, still.current], { scale: 2.6, duration: 1.6, ease: "power3.in", transformOrigin: "50% 46%" }, 0);
    tl.to(root.current, { autoAlpha: 0, duration: 1.0, ease: "power2.in" }, 0.55);
    tl.to(realm, { dive: 1, duration: reduce ? 0.01 : 2.8, ease: "power3.out" }, 0.45);
    tl.call(
      () => {
        setUi({ phase: "ready" });
        setGone(true);
      },
      [],
      1.7,
    );
    return () => {
      tl.kill();
    };
  }, [videoDone, worldReady, seen]);

  const skip = () => {
    const v = video.current;
    if (v) v.pause();
    setVideoDone(true);
  };

  if (gone) return null;
  return (
    <div ref={root} className={styles.intro} role="status" aria-label="Loading TECHNEX">
      {/* last frame, shown on repeat visits and while waiting for the world */}
      {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed frame, not content */}
      <img ref={still} src="/realm/intro/end.jpg" alt="" className={styles.introMedia} style={{ opacity: seen || videoDone ? 1 : 0 }} />
      {seen === false && (
        <video
          ref={video}
          className={styles.introMedia}
          muted
          playsInline
          preload="auto"
          poster="/realm/intro/poster.jpg"
          onEnded={() => setVideoDone(true)}
          style={{ opacity: videoDone ? 0 : 1 }}
        >
          <source src="/realm/intro/technex-intro-720.mp4" type="video/mp4" media="(max-width: 900px)" />
          <source src="/realm/intro/technex-intro-1080.mp4" type="video/mp4" />
        </video>
      )}

      <div className={styles.introBar}>
        <span className={styles.loadName}>TECHNEX</span>
        <span className={styles.loadPct}>
          <span ref={pctEl}>00</span>
        </span>
        {!videoDone && seen === false && (
          <button type="button" className={styles.skip} onClick={skip}>
            Skip intro
          </button>
        )}
        {videoDone && !worldReady && <span className={styles.loadWait}>Opening the realm…</span>}
      </div>
    </div>
  );
}
