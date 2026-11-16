"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "gsap";
import {
  allEvents,
  allWorkshops,
  festival,
  festivalDates,
  coordinatesLabel,
  navRoutes,
  registerHref,
} from "@/lib/content";
import IntroLoader from "./IntroLoader";
import { CHAPTERS, LAST, realm, setUi, useUi } from "./store";
import type { ScreenItem } from "./world/Screens";
import styles from "./realm.module.css";

const RealmCanvas = dynamic(() => import("./RealmCanvas"), { ssr: false });

function useCountdown(target: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start the clock on the client only
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, target.getTime() - (now ?? target.getTime()));
  const s = Math.floor(ms / 1000);
  return {
    ready: now !== null,
    parts: [
      { v: Math.floor(s / 86400), l: "Days" },
      { v: Math.floor((s % 86400) / 3600), l: "Hrs" },
      { v: Math.floor((s % 3600) / 60), l: "Min" },
      { v: s % 60, l: "Sec" },
    ],
  };
}

export default function RealmHome() {
  const { chapter, phase, hovered } = useUi();
  const [worldReady, setWorldReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const busy = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);
  const flash = useRef<HTMLDivElement>(null);

  const dates = festivalDates();
  const countdown = useCountdown(dates.startsAt);

  const events: ScreenItem[] = useMemo(
    () => allEvents().filter((e) => e.image).map((e) => ({ key: e.slug, title: e.name, image: e.image as string, href: e.href })),
    [],
  );
  const workshops: ScreenItem[] = useMemo(
    () => allWorkshops().filter((w) => w.cover).map((w) => ({ key: w.slug, title: w.title, image: w.cover, href: w.href })),
    [],
  );

  const onReady = useCallback(() => setWorldReady(true), []);

  // own the page: no native scroll on the realm
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add(styles.locked);
    realm.progress = 0;
    realm.dive = 0;
    setUi({ chapter: 0, phase: "loading", hovered: null });
    return () => {
      html.classList.remove(styles.locked);
      document.body.style.cursor = "";
    };
  }, []);

  const go = useCallback((next: number) => {
    const target = Math.max(0, Math.min(LAST, next));
    if (target === Math.round(realm.progress) && !busy.current) return;
    busy.current = true;
    setUi({ chapter: target, hovered: null });
    const dist = Math.abs(target - realm.progress);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tween.current?.kill();
    tween.current = gsap.to(realm, {
      progress: target,
      duration: reduce ? 0.01 : Math.min(3.6, 1.6 + dist * 0.55 + (target === 1 && realm.progress < 1 ? 0.6 : 0)),
      ease: "power2.inOut",
      onComplete: () => {
        busy.current = false;
      },
    });
    // release the lock a little early so a held wheel feels responsive
    window.setTimeout(() => (busy.current = false), reduce ? 50 : 1250);
  }, []);

  // wheel, touch, keys
  useEffect(() => {
    if (phase !== "ready") return;
    let acc = 0;
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      if (menu) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 260) acc = 0;
      lastWheel = now;
      acc += e.deltaY;
      if (busy.current) return;
      if (Math.abs(acc) > 40) {
        go(Math.round(realm.progress) + (acc > 0 ? 1 : -1));
        acc = 0;
      }
    };
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => (ty = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      const dy = ty - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 45 && !busy.current) go(Math.round(realm.progress) + (dy > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (menu) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(Math.round(realm.progress) + 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(Math.round(realm.progress) - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(LAST);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, go, menu]);

  // portal flash as the camera crosses the gate
  useEffect(() => {
    let id = 0;
    const loop = () => {
      const p = realm.progress;
      const f = Math.max(0, 1 - Math.abs(p - 0.74) / 0.09);
      if (flash.current) flash.current.style.opacity = String(f * f * 0.9);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const showUi = phase === "ready" || phase === "dive";
  const cur = CHAPTERS[chapter];

  return (
    <main className={styles.home}>
      <div className={styles.canvas}>
        <RealmCanvas events={events} workshops={workshops} onReady={onReady} />
      </div>
      <div ref={flash} className={styles.flash} aria-hidden />

      <IntroLoader worldReady={worldReady} />

      {/* ---------- HTML layer ---------- */}
      <header className={`${styles.top} ${showUi ? styles.in : ""}`}>
        <span className={styles.topDate}>{dates.label}</span>
        <button type="button" className={styles.brand} onClick={() => go(0)} aria-label="TECHNEX home">
          <span className={styles.brandName}>TECHNEX</span>
          <span className={styles.brandSub}>
            {festival.edition} · {festival.theme}
          </span>
        </button>
        <nav className={styles.topRight}>
          <Link href={registerHref} className={styles.pill}>
            Register
          </Link>
          <button type="button" className={styles.menuBtn} onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
            {menu ? "Close" : "Menu"}
          </button>
        </nav>
      </header>

      {/* chapter 0: gate copy (Tathva-style side block) */}
      <section className={`${styles.gateCopy} ${showUi && chapter === 0 ? styles.in : ""}`} aria-hidden={chapter !== 0}>
        <h1>
          Imagination.
          <br />
          Into reality.
        </h1>
        <p>{festival.tagline} {festival.host}, {festival.city}.</p>
        <div className={styles.count} aria-label="Countdown to TECHNEX">
          {countdown.parts.map((c) => (
            <div key={c.l}>
              <b>{countdown.ready ? String(c.v).padStart(2, "0") : "--"}</b>
              <span>{c.l}</span>
            </div>
          ))}
        </div>
        <div className={styles.ctaRow}>
          <Link href={registerHref} className={styles.cta}>
            Register now
          </Link>
          <button type="button" className={styles.ghost} onClick={() => go(1)}>
            Enter the realm ↓
          </button>
        </div>
      </section>

      <aside className={`${styles.coords} ${showUi && chapter === 0 ? styles.in : ""}`} aria-hidden>
        <span>{festival.hostShort}</span>
        <span>{coordinatesLabel(4)}</span>
      </aside>

      {/* chapter 4: register block */}
      <section className={`${styles.finale} ${showUi && chapter === LAST ? styles.in : ""}`} aria-hidden={chapter !== LAST}>
        <p className={styles.kicker}>Register · {festival.name}</p>
        <h2>
          Let&apos;s make it <em>real.</em>
        </h2>
        <div className={styles.ctaRow}>
          <Link href={registerHref} className={styles.cta}>
            Get your pass
          </Link>
          <Link href="/events" className={styles.ghost}>
            All events
          </Link>
        </div>
        <ul className={styles.contact}>
          <li>
            <a href={`mailto:${festival.email}`}>{festival.email}</a>
          </li>
          <li>
            <a href={festival.phoneHref}>{festival.phone}</a>
          </li>
          {festival.socials.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* caption */}
      <div className={`${styles.caption} ${showUi ? styles.in : ""}`} aria-live="polite">
        <span key={hovered ?? cur.id}>{hovered ?? cur.caption}</span>
        {chapter === 2 && !hovered && (
          <Link href="/events" className={styles.capLink}>
            View all events →
          </Link>
        )}
        {chapter === 3 && !hovered && (
          <Link href="/workshops" className={styles.capLink}>
            View all workshops →
          </Link>
        )}
      </div>

      {/* dots */}
      <nav className={`${styles.dots} ${showUi ? styles.in : ""}`} aria-label="Chapters">
        {CHAPTERS.map((c, i) => (
          <button key={c.id} type="button" className={i === chapter ? styles.dotOn : ""} onClick={() => go(i)} aria-label={c.label} aria-current={i === chapter}>
            <i />
            <span>{c.label}</span>
          </button>
        ))}
      </nav>

      <div className={`${styles.counter} ${showUi ? styles.in : ""}`} aria-hidden>
        <b>{String(chapter + 1).padStart(2, "0")}</b> / {String(CHAPTERS.length).padStart(2, "0")}
        <span>{cur.label}</span>
      </div>

      {chapter === 0 && showUi && <div className={styles.scrollHint}>Scroll</div>}

      {/* menu */}
      <div className={`${styles.menu} ${menu ? styles.menuOpen : ""}`} aria-hidden={!menu}>
        <ul>
          {navRoutes()
            .filter((r) => r.href !== "/")
            .map((r, i) => (
              <li key={r.href} style={{ transitionDelay: `${menu ? i * 30 : 0}ms` }}>
                <Link href={r.href} onClick={() => setMenu(false)} tabIndex={menu ? 0 : -1}>
                  {r.label}
                </Link>
              </li>
            ))}
        </ul>
      </div>

      {/* Content for screen readers and search engines (the world is visual) */}
      <section className="sr-only">
        <h2>{festival.name} {festival.edition} — {festival.theme}</h2>
        <p>{dates.label}, {festival.host}, {festival.address}</p>
        <h3>Events</h3>
        <ul>
          {allEvents().map((e) => (
            <li key={e.slug}>
              <a href={e.href}>{e.name}</a> — {e.tagline}
            </li>
          ))}
        </ul>
        <h3>Workshops</h3>
        <ul>
          {allWorkshops().map((w) => (
            <li key={w.slug}>
              <a href={w.href}>{w.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
