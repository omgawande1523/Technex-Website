'use client';
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EVENT_LIST_SCROLL_KEY, events, siteConfig } from '@/constants/events';
import { createSceneState } from '@/lib/event-scene-state';
import type { SceneState } from '@/lib/event-scene-state';
import Terrain from './Terrain';
import Timeline from './Timeline';
import Hud from './Hud';
import LogoCard from './LogoCard';

const N = events.length;

/* ── tune the look here ─────────────────────────────── */
const SPACING = 0.58; // distance between cards (fraction of stage width)
const TILT = 42; // degrees each card turns per step
const DEPTH = 300; // px the side cards come toward the camera per step
/* ───────────────────────────────────────────────────── */

/** small spinning turbine icon */
const Turbine = () => (
  <svg className="ev-turb" viewBox="-50 -50 100 100" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <path key={i} transform={`rotate(${i * 60})`} d="M0 -4 C 14 -10, 30 -22, 40 -8 C 28 -16, 14 -12, 4 -2 Z" />
    ))}
    <circle r="5" />
  </svg>
);

const Arrow = () => (
  <svg viewBox="0 0 16 10" aria-hidden="true">
    <path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const Diag = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M2 12L12 2M4 2h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const Cross = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M2 2l10 10M12 2L2 12" fill="none" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

/** Register + Explore pair (used on desktop and on phones) */
function Actions({
  href,
  on,
  onExplore,
}: {
  href: string;
  on: boolean;
  onExplore: () => void;
}) {
  return (
    <>
      <Link className="ev-cta" href={href} tabIndex={on ? 0 : -1}>
        <span className="ev-cta-txt">Register</span>
        <span className="ev-cta-ico">
          <Arrow />
        </span>
      </Link>

      <button
        type="button"
        className="ev-cta ev-ghost"
        tabIndex={on ? 0 : -1}
        onClick={onExplore}
      >
        <span className="ev-cta-txt">Explore</span>
        <span className="ev-cta-ico">
          <Diag />
        </span>
      </button>
    </>
  );
}

export default function EventsExperience() {
  const router = useRouter();
  const state = useRef<SceneState>(createSceneState());
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [openIdx, setOpenIdx] = useState<number | null>(null); // Explore popup
  const openRef = useRef<number | null>(null);
  useEffect(() => {
    openRef.current = openIdx;
  }, [openIdx]);
  const [flipped, setFlipped] = useState<number | null>(null); // card showing its back (description)

  useLayoutEffect(() => {
    const savedScroll = sessionStorage.getItem(EVENT_LIST_SCROLL_KEY);
    if (savedScroll === null) return;

    sessionStorage.removeItem(EVENT_LIST_SCROLL_KEY);
    const scrollY = Number(savedScroll);
    if (Number.isFinite(scrollY)) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
  }, []);

  const unit = useCallback((): number => {
    const first = trackRef.current?.firstElementChild as HTMLElement | null;
    return first?.offsetHeight || window.innerHeight;
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(N - 1, i));
      window.scrollTo({ top: clamped * unit(), behavior: 'smooth' });
    },
    [unit],
  );

  /* right-side list: teleport straight to a card, no scrolling animation */
  const jumpTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(N - 1, i));
      const s = state.current;
      s.target = clamped;
      s.cur = clamped; // skip the glide, card is already in front
      s.vel = 0;
      window.scrollTo({ top: clamped * unit(), behavior: 'instant' as ScrollBehavior });
      setFlipped(null);
      setActive(clamped);
    },
    [unit],
  );

  /* mobile strip: keep the active chip centred */
  useEffect(() => {
    const nav = jumpRef.current?.querySelector<HTMLElement>('ul');
    const btn = nav?.querySelector<HTMLElement>('.is-active');
    if (!nav || !btn) return;
    nav.scrollTo({ left: btn.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + btn.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  const onCardClick = (i: number) => {
    if (i !== active) goTo(i);
    else setFlipped((f) => (f === i ? null : i));
  };

  const exploreEvent = (slug: string) => {
    sessionStorage.setItem(EVENT_LIST_SCROLL_KEY, String(window.scrollY));
    router.push(`/events/${slug}`);
  };

  /* Explore popup: Esc closes it, page scroll is locked while it is open */
  useEffect(() => {
    if (openIdx === null) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [openIdx]);

  useEffect(() => {
    const s = state.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    let lastActive = 0;

    const readScroll = () => {
      s.target = Math.min(N - 1, Math.max(0, window.scrollY / unit()));
    };
    readScroll();
    s.cur = s.target;
    lastActive = Math.round(s.cur);
    setActive(lastActive);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      if (!reduce) s.time += dt;

      const prev = s.cur;
      s.cur += (s.target - s.cur) * (reduce ? 1 : 1 - Math.exp(-dt * 4.5));
      s.vel += ((s.cur - prev) / dt - s.vel) * 0.18;
      s.intro += (1 - s.intro) * (reduce ? 1 : 1 - Math.exp(-dt * 1.7));

      const sceneW = panelRefs.current[0]?.parentElement?.clientWidth || window.innerWidth;
      const mobile = window.innerWidth < 760;
      const spacing = mobile ? Math.max(210, sceneW * 0.72) : sceneW * SPACING;

      for (let i = 0; i < N; i++) {
        const el = panelRefs.current[i];
        if (!el) continue;
        const d = i - s.cur;
        const ad = Math.abs(d);

        if (ad > 2.7) {
          el.style.visibility = 'hidden';
          continue;
        }
        el.style.visibility = 'visible';

        const dc = Math.max(-2, Math.min(2, d));
        const x = d * spacing * (1 + (1 - s.intro) * 0.35) - (mobile ? 0 : 48);
        const y = Math.sin(s.time * 0.6 + i * 1.7) * (mobile ? 2 : 5);
        const z = Math.pow(Math.min(ad, 2.2), 0.85) * (mobile ? 90 : DEPTH) - (1 - s.intro) * (mobile ? 120 : 700);
        const ry = -dc * TILT;
        const fade = 1 - Math.min(1, Math.max(0, (ad - 1.5) / 1.1));
        const focus = 1 - Math.min(1, ad);

        el.style.transform =
          `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
        el.style.opacity = (fade * Math.min(1, s.intro * 1.3)).toFixed(3);
        el.style.setProperty('--focus', focus.toFixed(3));
      }

      const a = Math.round(s.cur);
      if (a !== lastActive) {
        lastActive = a;
        setFlipped(null);
        setActive(a);
      }
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (openRef.current !== null) return; // popup open → don't move the cards
      const idx = Math.round(window.scrollY / unit());
      let to: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') to = idx + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') to = idx - 1;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = N - 1;
      if (to !== null) {
        e.preventDefault();
        goTo(to);
      }
    };

    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [goTo, unit]);

  const total = String(N).padStart(2, '0');
  const opened = openIdx !== null ? events[openIdx] : null;

  return (
    <main className="ev-root">
      <style>{`
        /* Compact floating event selector, vertically centred beside social links. */
        .ev-stage .ev-jump {
          position: fixed !important;
          top: max(120px, 50%) !important;
          transform: translateY(-50%) !important;
          right: 106px !important;
          bottom: auto !important;
          left: auto !important;
          width: clamp(184px, 12.5vw, 218px) !important;
          height: min(66vh, 550px) !important;
          max-height: calc(100dvh - 190px) !important;
          z-index: 35 !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 11px 7px 10px !important;
          overflow: hidden !important;
          border: 1px solid rgba(217, 168, 86, .20) !important;
          border-radius: 14px !important;
          background: linear-gradient(160deg, rgba(22,19,17,.93), rgba(7,8,11,.95)) !important;
          box-shadow: 0 18px 42px rgba(0,0,0,.36), inset 0 1px rgba(255,225,163,.07) !important;
          backdrop-filter: blur(14px);
          box-sizing: border-box !important;
        }
        .ev-stage .ev-jump::before {
          content: ''; position: absolute; top: 0; left: 30px; right: 30px;
          height: 1px; background: linear-gradient(90deg,transparent,rgba(244,195,103,.7),transparent);
          pointer-events: none;
        }
        .ev-stage .ev-jump-h {
          flex: 0 0 auto; display: block !important;
          padding: 5px 10px 10px !important;
          color: #e6bc73 !important; font-size: 11px !important;
          letter-spacing: .24em !important; text-transform: uppercase;
          text-align: center !important;
        }
        .ev-stage .ev-jump ul {
          display: flex !important; flex-direction: column !important;
          min-height: 0 !important; flex: 1 1 auto !important;
          overflow-y: auto !important; overflow-x: hidden !important;
          padding: 0 2px 2px !important; margin: 0 !important;
          scrollbar-width: thin; scrollbar-color: rgba(222,176,99,.5) transparent;
        }
        .ev-stage .ev-jump li {
          width: 100% !important; flex: 0 0 auto !important;
          list-style: none !important;
        }
        .ev-stage .ev-jump li button {
          width: 100% !important; min-height: 41px !important;
          padding: 9px 9px !important;
          display: flex !important; justify-content: space-between !important;
          align-items: center !important; gap: 9px !important;
          border-radius: 7px !important;
          border: 1px solid transparent !important;
          color: #d6d0c5 !important;
          background: transparent !important;
          transition: background .24s ease, color .24s ease, transform .24s ease, border-color .24s ease !important;
        }
        .ev-stage .ev-jump li button:hover {
          background: rgba(220,173,91,.11) !important;
          color: #ffe1a1 !important;
          transform: translateX(2px);
        }
        .ev-stage .ev-jump li button.is-active {
          color: #f8d48c !important;
          background: linear-gradient(90deg,rgba(218,166,77,.20),rgba(218,166,77,.035)) !important;
          border-color: rgba(235,189,105,.20) !important;
          box-shadow: inset 2px 0 #e7b966;
        }
        .ev-stage .ev-jump-name {
          flex: 1; min-width: 0; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
          text-align: left; font-size: 12.5px !important;
          letter-spacing: .045em !important;
        }
        .ev-stage .ev-jump-num {
          flex: 0 0 auto; color: #e7bf73 !important;
          font-size: 12px !important;
        }
        /* Keep the entire content group slightly left of the event selector. */
        @media (min-width: 1101px) {
          .ev-stage .ev-out { transform: translateX(-18px); }
        }
        @media (min-width: 761px) and (max-width: 1100px) {
          .ev-stage .ev-jump {
            right: 84px !important; width: 176px !important;
            height: min(62vh, 480px) !important;
          }
          .ev-stage .ev-jump-name { font-size: 12px !important; }
        }
        /* Mobile-only: heading, card, actions, then bottom event selector. */
        @media (max-width: 760px) {
          .ev-stage .ev-jump {
            position: fixed !important;
            top: auto !important;
            bottom: max(12px, env(safe-area-inset-bottom)) !important;
            left: 64px !important;
            right: 64px !important;
            width: auto !important;
            height: 49px !important;
            max-height: 49px !important;
            transform: none !important;
            padding: 4px !important;
            border-radius: 12px !important;
            flex-direction: row !important;
            z-index: 90 !important;
            background: rgba(13,12,13,.96) !important;
            backdrop-filter: blur(8px) !important;
          }
          .ev-stage .ev-jump-h { display: none !important; }
          .ev-stage .ev-jump ul {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 5px !important;
            width: 100% !important;
            flex: 1 1 auto !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scrollbar-width: none;
            scroll-snap-type: x proximity;
          }
          .ev-stage .ev-jump ul::-webkit-scrollbar { display: none; }
          .ev-stage .ev-jump li { width: auto !important; flex: 0 0 auto !important; }
          .ev-stage .ev-jump li button {
            width: auto !important;
            min-height: 35px !important;
            padding: 6px 9px !important;
            white-space: nowrap;
            scroll-snap-align: center;
            transform: none !important;
          }
          .ev-stage .ev-jump-name { max-width: 96px; font-size: 10px !important; }
          .ev-stage .ev-jump-num { font-size: 10px !important; }

          /* Keep desktop carousel interpolation, perspective and card rotation. */
          .ev-stage .ev-scene { perspective: 950px !important; }
          .ev-stage .ev-panel {
            left: 50% !important;
            top: calc(50% - 24px) !important;
            width: min(60vw, 285px) !important;
            max-width: calc(100vw - 132px) !important;
            height: min(67dvh, 490px) !important;
            max-height: calc(100dvh - 180px) !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: clamp(9px, 1.7dvh, 16px) !important;
            transform-style: preserve-3d !important;
            box-sizing: border-box !important;
          }
          .ev-stage .ev-out {
            position: relative !important;
            inset: auto !important;
            order: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            text-align: center !important;
            flex: 0 0 auto !important;
          }
          .ev-stage .ev-out-top { justify-content: center !important; gap: 9px !important; }
          .ev-stage .ev-num { font-size: clamp(27px, 8vw, 40px) !important; line-height: 1 !important; }
          .ev-stage .ev-title {
            font-size: clamp(15px, 4.6vw, 21px) !important;
            line-height: 1.08 !important;
            margin: 5px 0 0 !important;
            overflow-wrap: anywhere;
          }
          .ev-stage .ev-tag { font-size: 9px !important; }
          .ev-stage .ev-spins, .ev-stage .ev-plus { display: none !important; }
          .ev-stage .ev-out .ev-btns { display: none !important; }
          .ev-stage .ev-flip {
            position: relative !important;
            inset: auto !important;
            order: 1 !important;
            flex: 0 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            height: clamp(135px, 30dvh, 255px) !important;
            margin: 0 !important;
            transform-style: preserve-3d !important;
          }
          .ev-stage .ev-face, .ev-stage .ev-plate, .ev-stage .ev-glass,
          .ev-stage .ev-frame { max-width: 100% !important; }
          .ev-stage .ev-more {
            display: block !important;
            position: relative !important;
            inset: auto !important;
            order: 2 !important;
            flex: 0 0 auto !important;
            width: 100% !important;
            margin: 0 !important;
            transform: none !important;
          }
          .ev-stage .ev-btns-m {
            display: flex !important;
            flex-wrap: nowrap !important;
            justify-content: center !important;
            gap: 7px !important;
            width: 100% !important;
          }
          .ev-stage .ev-btns-m .ev-cta {
            min-width: 0 !important;
            width: calc(50% - 4px) !important;
            max-width: none !important;
            height: 38px !important;
            padding: 0 5px !important;
            font-size: 10px !important;
            box-sizing: border-box !important;
          }
          .ev-stage .ev-btns-m .ev-cta-ico { width: 23px !important; height: 23px !important; flex-shrink: 0; }
          .ev-stage .ev-flip-hint { font-size: 8px !important; }
          .ev-stage .ev-back-title { font-size: 15px !important; }
          .ev-stage .ev-back-body { font-size: 10px !important; }
          .ev-stage .ev-vignette { pointer-events: none; }
        }
        @media (max-width: 390px) {
          .ev-stage .ev-panel { width: calc(100vw - 130px) !important; }
          .ev-stage .ev-jump { left: 61px !important; right: 61px !important; }
          .ev-stage .ev-flip { height: clamp(128px, 27dvh, 218px) !important; }
        }
        @media (max-width: 760px) and (max-height: 690px) {
          .ev-stage .ev-panel { gap: 6px !important; top: calc(50% - 18px) !important; }
          .ev-stage .ev-flip { height: clamp(110px, 24dvh, 180px) !important; }
          .ev-stage .ev-num { font-size: 26px !important; }
          .ev-stage .ev-title { font-size: 15px !important; }
          .ev-stage .ev-btns-m .ev-cta { height: 34px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-stage .ev-jump li button { transition: none !important; }
        }
      `}</style>

      <h1 className="ev-sr">
        {siteConfig.brand} {siteConfig.section}
      </h1>

      <div className="ev-stage">
        <Terrain state={state} />
        <div className="ev-grain" aria-hidden="true" />

        <div className="ev-scene">
          {events.map((ev, i) => {
           const href = `/register/${ev.slug}`;
            const on = i === active;
            const isFlipped = flipped === i;
            return (
              <article
                key={ev.id}
                className="ev-panel"
                data-active={on}
                aria-label={ev.title}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                {/* ── flipping card: front = logo, back = description ── */}
                <div className={`ev-flip${isFlipped ? ' is-flipped' : ''}`}>
                  <div
                    className="ev-face ev-front"
                    role="button"
                    tabIndex={on ? 0 : -1}
                    aria-pressed={isFlipped}
                    aria-label={`${ev.title} – click to read details`}
                    onClick={() => onCardClick(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCardClick(i);
                      }
                    }}
                  >
                    <div className="ev-plate">
                      <span className="ev-screws" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>

                      <div className="ev-glass">
                        <i className="ev-edge ev-edge-l" aria-hidden="true" />
                        <i className="ev-edge ev-edge-r" aria-hidden="true" />

                        {/* full-size logo window */}
                        <div className="ev-frame">
                          <LogoCard id={ev.id} title={ev.title} index={i} state={state} />
                          <i className="ev-scan" aria-hidden="true" />
                          <i className="ev-c ev-c1" aria-hidden="true" />
                          <i className="ev-c ev-c2" aria-hidden="true" />
                          <i className="ev-c ev-c3" aria-hidden="true" />
                          <i className="ev-c ev-c4" aria-hidden="true" />
                        </div>

                        <div className="ev-bar" aria-hidden="true">
                          <span className="ev-barcode" />
                          <span className="ev-stars">✦ ✦ ✦</span>
                          <span className="ev-idx">
                            {ev.id} | {total}
                          </span>
                          <span className="ev-src-line">{ev.source} ®</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ev-face ev-back" aria-hidden={!isFlipped} onClick={() => setFlipped(null)}>
                    <div className="ev-plate">
                      <span className="ev-screws" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                      <div className="ev-back-glass">
                        <div className="ev-back-head">
                          <span className="ev-back-num">{ev.id}</span>
                          <span className="ev-tag">{ev.tag}</span>
                          <span className="ev-back-hint" aria-hidden="true">Click to close ✕</span>
                        </div>
                        <h3 className="ev-back-title">{ev.title}</h3>
                        <div className="ev-back-body">
                          <div className="ev-block">
                            <span className="ev-k">Imagined concept</span>
                            <b className="ev-src">{ev.source}</b>
                            <p>{ev.concept}</p>
                          </div>
                          <div className="ev-block">
                            <span className="ev-k">Real-world innovation</span>
                            <p>{ev.innovation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {on && !isFlipped && (
                    <span className="ev-flip-hint" aria-hidden="true">
                      Tap card to read about it
                    </span>
                  )}
                </div>

                {/* ── LEFT of the card: number · category · name · buttons ── */}
                <div className="ev-out">
                  <div className="ev-out-top">
                    <span className="ev-num">{ev.id}</span>
                    <div className="ev-spins" aria-hidden="true">
                      <Turbine />
                      <Turbine />
                    </div>
                  </div>
                  {ev.slug === "hackathon" && (
                    <Image
                      src="/assets/events/csi-svpcet.png"
                      alt="Computer Society of India, SVPCET"
                      width={112}
                      height={112}
                      className="ev-out-csi"
                    />
                  )}

                  <span className="ev-tag">{ev.tag}</span>

                  <h2 className="ev-title">{ev.title}</h2>

                  <div className="ev-btns">
                    <Actions href={href} on={on} onExplore={() => exploreEvent(ev.slug)} />
                  </div>
                </div>

                <i className="ev-plus" aria-hidden="true" />

                {/* phone buttons (hidden on desktop) */}
                <div className="ev-more">
                  <div className="ev-btns-m">
                    <Actions href={href} on={on} onExplore={() => exploreEvent(ev.slug)} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="ev-vignette" aria-hidden="true" />

        {/* ── right-side quick list: number + short name, click = jump to that card ── */}
        <nav className="ev-jump" ref={jumpRef} aria-label="Jump to event">
          <span className="ev-jump-h">Events</span>
          <ul>
            {events.map((ev, i) => (
              <li key={ev.id}>
                <button
                  type="button"
                  className={i === active ? 'is-active' : ''}
                  aria-current={i === active ? 'true' : undefined}
                  title={ev.title}
                  onClick={() => jumpTo(i)}
                >
                  <span className="ev-jump-name">{ev.title}</span>
                  <b className="ev-jump-num">{ev.id}</b>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <Hud index={active} total={N} showHint={active === 0} />
        <Timeline state={state} active={active} items={events.map((e) => e.id)} onSelect={goTo} />

        {/* ── EXPLORE popup ── */}
        {opened && (
          <div className="ev-modal" role="dialog" aria-modal="true" aria-label={opened.title} onClick={() => setOpenIdx(null)}>
            <div className="ev-modal-card" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="ev-modal-x" aria-label="Close" onClick={() => setOpenIdx(null)}>
                ×
              </button>
              <div className="ev-modal-top">
                <span className="ev-modal-num">{opened.id}</span>
                <span className="ev-modal-tag">{opened.tag}</span>
              </div>
              <h3 className="ev-modal-title">{opened.title}</h3>

              <div className="ev-modal-grid">
                <div className="ev-block">
                  <span className="ev-k">Imagined concept</span>
                  <b className="ev-src">{opened.source}</b>
                  <p>{opened.concept}</p>
                </div>
                <div className="ev-block">
                  <span className="ev-k">Real-world innovation</span>
                  <p>{opened.innovation}</p>
                </div>
              </div>

              <div className="ev-modal-actions">
              <Link className="ev-cta" href={`/register/${opened.slug}`}>
  <span className="ev-cta-txt">Register</span>
  <span className="ev-cta-ico">
    <Arrow />
  </span>
</Link>
                <button type="button" className="ev-cta ev-ghost" onClick={() => setOpenIdx(null)}>
                  <span className="ev-cta-txt">Close</span>
                  <span className="ev-cta-ico">
                    <Cross />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="ev-track" ref={trackRef} aria-hidden="true">
        {events.map((ev) => (
          <section key={ev.id} className="ev-snap" />
        ))}
      </div>
    </main>
  );
}