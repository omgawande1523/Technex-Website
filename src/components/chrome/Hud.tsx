"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { festival, registerHref, routeLabel } from "@/lib/content";
import { setHud, useHud } from "@/lib/hud";
import { isSoundOn, setSound, subscribeSound } from "@/lib/sound";
import { useLenis } from "@/components/providers/SmoothScroll";
import MegaMenu from "./MegaMenu";
import styles from "./chrome.module.css";

/**
 * Section-aware HUD. On the home page each scene root carries
 * `data-hud="LABEL"`; the scene crossing the middle of the viewport names the
 * pill. Other routes show the route name.
 */
export default function Hud() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scene, gateOpen } = useHud();
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const soundOn = useSyncExternalStore(subscribeSound, isSoundOn, () => false);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      setAtTop(window.scrollY < window.innerHeight * 0.25);
      if (!isHome) return;
      const mid = window.innerHeight / 2;
      let current: string | null = null;
      document.querySelectorAll<HTMLElement>("[data-hud]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) current = el.dataset.hud ?? null;
      });
      if (current) setHud({ scene: current });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, pathname]);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [menuOpen, lenis]);

  const label = isHome ? (scene ?? festival.shortName) : routeLabel(pathname);

  return (
    <>
      <header className={styles.hud} data-gate-open={gateOpen || !isHome}>
        <div className={styles.hudProgress} aria-hidden="true">
          <div ref={progressRef} className={styles.hudProgressFill} />
        </div>

        <Link href="/" className={styles.hudLogo} aria-label={`${festival.name} home`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny fixed-size logo */}
          <img src="/logo_topnav.webp" alt="" width={40} height={40} />
          <span className={styles.hudLogoText}>{festival.name}</span>
        </Link>

        <div className={styles.hudPill} aria-live="polite">
          <span className={styles.hudPillDot} aria-hidden="true" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={label}
              className={styles.hudPillText}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className={styles.hudRight}>
          <button
            type="button"
            className={styles.hudSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
            onClick={() => setSound(!soundOn)}
          >
            <span className={styles.hudSoundBars} data-on={soundOn} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
          <Link href={registerHref} className={styles.hudRegister} data-magnetic>
            Register
          </Link>
          <button
            type="button"
            className={styles.hudBurger}
            aria-expanded={menuOpen}
            aria-controls="mega-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
            data-open={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {isHome && gateOpen && (
        <div className={styles.scrollHint} data-hidden={!atTop} aria-hidden="true">
          <span>scroll</span>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {(gateOpen || !isHome) && (
        <button
          type="button"
          className={styles.chatLauncher}
          onClick={() => window.dispatchEvent(new CustomEvent("open-chatbot"))}
          aria-label="Ask TECHNEX AI"
          data-magnetic
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static icon */}
          <img src="/assets/chatbot-icon.webp" alt="" width={34} height={34} />
        </button>
      )}

      <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
