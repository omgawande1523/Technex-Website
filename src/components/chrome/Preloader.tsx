"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { preloadImage, subscribeProgress, trackAsset } from "@/lib/preload";
import { setHud } from "@/lib/hud";
import { setSound, storedSoundPreference } from "@/lib/sound";
import { festival, festivalDates } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";
import { SPLASH_PATH } from "./splashPath";
import { GATE_SESSION_KEY as SESSION_KEY } from "./gateScript";
import styles from "./chrome.module.css";

const LOGO = "/tnx_logo_trimmed.webp";
const MIN_SHOW_MS = 1400;
const MAX_WAIT_MS = 10_000;
const DROP_PATH = "M50,8 C50,8 38,30 38,40 C38,47 43.5,52 50,52 C56.5,52 62,47 62,40 C62,30 50,8 50,8 Z";

export default function Preloader() {
  const pathname = usePathname();
  const lenis = useLenis();
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const shownProgress = useRef({ v: 0 });

  // Decide once whether the gate is needed this session.
  useEffect(() => {
    const entered = document.documentElement.dataset.entered === "1";
    if (entered || pathname !== "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of sessionStorage state set by gateScript
      setVisible(false);
      setHud({ gateOpen: true });
      return;
    }
    setSoundOn(storedSoundPreference());
    trackAsset(document.fonts.ready);
    preloadImage(LOGO);
    const started = performance.now();
    // Lazily mounted scenes (the hero model) register a little later, so
    // "complete" has to hold for a short grace period before unlocking.
    const latest = { loaded: 0, total: 0 };
    let check: number | undefined;
    const unsub = subscribeProgress(({ loaded, total }) => {
      latest.loaded = loaded;
      latest.total = total;
      setProgress(total ? Math.round((loaded / total) * 100) : 0);
      window.clearTimeout(check);
      if (total && loaded >= total) {
        const wait = Math.max(400, MIN_SHOW_MS - (performance.now() - started));
        check = window.setTimeout(() => {
          if (latest.loaded >= latest.total) setReady(true);
        }, wait);
      }
    });
    const bail = window.setTimeout(() => setReady(true), MAX_WAIT_MS);
    return () => {
      unsub();
      window.clearTimeout(check);
      window.clearTimeout(bail);
    };
    // Runs on mount only: the gate is for the entry route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hold scrolling while the gate is up.
  useEffect(() => {
    if (!visible) return;
    lenis?.stop();
    document.documentElement.classList.add(styles.lockScroll);
    return () => {
      lenis?.start();
      document.documentElement.classList.remove(styles.lockScroll);
    };
  }, [visible, lenis]);

  // Ink drop → splash → logo.
  useGSAP(
    () => {
      if (!visible) return;
      if (prefersReducedMotion()) {
        gsap.set(`.${styles.gateLogo}`, { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(`.${styles.gateDrop}`, { y: -260, scaleY: 1.25 }, { y: 0, scaleY: 1, duration: 0.7, ease: "power2.in" })
        .to(`.${styles.gateDrop}`, { morphSVG: SPLASH_PATH, duration: 0.35, ease: "expo.out" })
        .fromTo(
          `.${styles.gateRipple}`,
          { scale: 0.2, autoAlpha: 0.9, transformOrigin: "50% 50%" },
          { scale: 2.6, autoAlpha: 0, duration: 1.1, ease: "power2.out", stagger: 0.18 },
          "<",
        )
        .to(`.${styles.gateDrop}`, { scale: 1.6, transformOrigin: "50% 50%", duration: 1, ease: "power3.out" }, "<")
        .fromTo(`.${styles.gateLogo}`, { autoAlpha: 0, scale: 0.92, filter: "blur(8px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.9 }, "-=0.6")
        .to(`.${styles.gateDrop}`, { autoAlpha: 0.18, duration: 0.8 }, "<");
    },
    { scope: rootRef, dependencies: [visible] },
  );

  // Smoothly count the visible number toward the real percentage.
  useEffect(() => {
    if (!visible) return;
    const el = rootRef.current?.querySelector(`.${styles.gateCount}`);
    const tween = gsap.to(shownProgress.current, {
      v: progress,
      duration: 0.5,
      ease: "power1.out",
      onUpdate: () => {
        if (el) el.textContent = String(Math.round(shownProgress.current.v)).padStart(3, "0");
      },
    });
    return () => {
      tween.kill();
    };
  }, [progress, visible]);

  const enter = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode: gate shows again next load, harmless */
    }
    document.documentElement.dataset.entered = "1";
    if (soundOn) setSound(true);
    setHud({ gateOpen: true });
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) {
      setVisible(false);
      return;
    }
    gsap.to(root, {
      clipPath: "circle(0% at 50% 50%)",
      duration: 0.9,
      ease: "power3.inOut",
      onComplete: () => setVisible(false),
    });
  };

  if (!visible) return null;

  return (
    <div ref={rootRef} className={styles.gate} role="dialog" aria-modal="true" aria-label={`${festival.name} ${festival.edition} loading`}>
      <div className={styles.gateHalftone} aria-hidden="true" />
      <svg className={styles.gateArt} viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.gateRipple} cx="50" cy="40" r="14" />
        <circle className={styles.gateRipple} cx="50" cy="40" r="14" />
        <path className={styles.gateDrop} d={DROP_PATH} />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element -- must render before hydration-time image optimisation */}
      <img className={styles.gateLogo} src={LOGO} alt={`${festival.name} ${festival.edition}`} width={465} height={256} />

      <div className={styles.gateFooter}>
        <p className={styles.gateMeta}>
          {festival.theme} · {festivalDates().label} · {festival.hostShort} {festival.city}
        </p>
        {!ready ? (
          <p className={styles.gateProgress} aria-live="polite">
            <span className={styles.gateCount}>000</span>
            <span>%</span>
            <span className="sr-only"> loaded ({progress}%)</span>
          </p>
        ) : (
          <div className={styles.gateActions}>
            <button type="button" className={styles.gateEnter} onClick={enter} autoFocus data-magnetic data-gate-enter>
              [ Enter ]
            </button>
            <button
              type="button"
              className={styles.gateSound}
              aria-pressed={soundOn}
              onClick={() => setSoundOn((v) => !v)}
            >
              Sound: {soundOn ? "on" : "off"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
