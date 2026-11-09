'use client';

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
function Actions({ href, on, onExplore }: { href: string; on: boolean; onExplore: () => void }) {
  return (
    <>
      <a className="ev-cta" href={href} tabIndex={on ? 0 : -1}>
        <span className="ev-cta-txt">Register</span>
        <span className="ev-cta-ico">
          <Arrow />
        </span>
      </a>
      <button type="button" className="ev-cta ev-ghost" tabIndex={on ? 0 : -1} onClick={onExplore}>
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
    const nav = jumpRef.current;
    const btn = nav?.querySelector<HTMLElement>('.is-active');
    if (!nav || !btn) return;
    nav.scrollTo({ left: btn.offsetLeft - nav.clientWidth / 2 + btn.clientWidth / 2, behavior: 'smooth' });
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
      const spacing = mobile ? sceneW * 0.85 : sceneW * SPACING;

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
        const x = d * spacing * (1 + (1 - s.intro) * 0.35);
        const y = Math.sin(s.time * 0.6 + i * 1.7) * 5;
        const z = Math.pow(Math.min(ad, 2.2), 0.85) * DEPTH - (1 - s.intro) * 700;
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
      <h1 className="ev-sr">
        {siteConfig.brand} {siteConfig.section}
      </h1>

      <div className="ev-stage">
        <Terrain state={state} />
        <div className="ev-grain" aria-hidden="true" />

        <div className="ev-scene">
          {events.map((ev, i) => {
            const href = ev.registerUrl ?? siteConfig.registerUrl;
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
                <a className="ev-cta" href={opened.registerUrl ?? siteConfig.registerUrl}>
                  <span className="ev-cta-txt">Register</span>
                  <span className="ev-cta-ico">
                    <Arrow />
                  </span>
                </a>
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