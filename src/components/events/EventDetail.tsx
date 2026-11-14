"use client";
import { useEffect, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EVENT_LIST_SCROLL_KEY } from "@/constants/events";
import type { EventItem, IconKind } from "@/types/event";
import TerrainBackground from "./TerrainBackground";

const TABS = ["About", "Rounds", "Rule book", "Contact", "FAQs"] as const;
type Tab = (typeof TABS)[number];

const FALLBACK_IMAGE = "/hackathon.webp";
const OFFICIAL_EMAIL = "technex@stvincentngp.edu.in";

// Edit these to match your real event details
const HIGHLIGHTS = [
  { value: "24 hrs", label: "Non-stop building" },
  { value: "2–4", label: "Members per team" },
  { value: "₹70K+", label: "Prize pool" },
];

const PERKS = [
  "Mentor guidance from industry experts and faculty",
  "Certificates for every participant",
  "Goodies, swag and cash prizes for winners",
];

const WHO_CAN_JOIN =
  "Undergraduate students across India (BTech, BE, BCA, and BSc).";

const ICONS: Record<IconKind, string> = {
  calendar: "M7 2v3M17 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  pin: "M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  team: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1.5a4 4 0 0 0-3-3.9M16 4.2a3.5 3.5 0 0 1 0 6.6",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3",
};
// Lightweight Lucide-style SVGs, with no additional package required.
const ROUND_PATHS = [
  <><path d="M4 5h16v14H4z"/><path d="m8 9 2 2-2 2M13 15h4"/></>,
  <><path d="M4 19V5M4 19h16M8 15v-4M13 15V7M18 15V9"/></>,
  <><path d="M12 3 9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5L12 3Z"/><path d="M19 17v4M17 19h4"/></>,
  <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></>,
];
const RoundIcon = ({ index }: { index: number }) => (
  <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {ROUND_PATHS[index % ROUND_PATHS.length]}
  </svg>
);

const Icon = ({ k }: { k: IconKind }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={ICONS[k]} />
  </svg>
);

export default function EventDetail({
  event: e,
  backHref,
  backLabel = "← Back to all events",
}: {
  event: EventItem;
  /** Optional explicit destination for the back button (e.g. "/workshops"). */
  backHref?: string;
  backLabel?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add("event-detail-scroll-enabled");
    document.body.classList.add("event-detail-scroll-enabled");
    return () => {
      document.documentElement.classList.remove("event-detail-scroll-enabled");
      document.body.classList.remove("event-detail-scroll-enabled");
    };
  }, []);
  const [tab, setTab] = useState<Tab>("About");
  const [open, setOpen] = useState<number | null>(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const imgSrc = imgFailed || !e.image ? FALLBACK_IMAGE : e.image;

  const backToEvents = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    if (sessionStorage.getItem(EVENT_LIST_SCROLL_KEY) !== null) {
      router.back();
      return;
    }
    router.push("/events");
  };

  // arrow keys move between tabs (accessibility + feels good)
  const onTabKey = (ev: KeyboardEvent<HTMLElement>) => {
    const i = TABS.indexOf(tab);
    if (ev.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length]);
    else if (ev.key === "ArrowLeft") setTab(TABS[(i - 1 + TABS.length) % TABS.length]);
    else return;
    ev.preventDefault();
  };

  // cursor-follow glow + slight parallax on the hero image
  const onMove = (ev: MouseEvent<HTMLDivElement>) => {
    const el = ev.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.style.setProperty("--mx", `${(x - 0.5) * -18}px`);
    el.style.setProperty("--my", `${(y - 0.5) * -18}px`);
  };
  const onLeave = (ev: MouseEvent<HTMLDivElement>) => {
    const el = ev.currentTarget;
    el.style.setProperty("--gx", "50%");
    el.style.setProperty("--gy", "50%");
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  };

  const highlights = e.highlights ?? (e.slug === "hackathon" ? HIGHLIGHTS : []);
  const perks = e.perks ?? (e.slug === "hackathon" ? PERKS : []);

  return (
    <>
      <TerrainBackground />
      <main className="page">
        <button className="btn line back-events" type="button" onClick={backToEvents}>
          {backLabel}
        </button>

                <header className="head">
          <div className="titleblock">
            <span className="event-category-tag">{e.category}</span>
            <h1>{e.name}</h1>
            <p className="tag">{e.tagline}</p>

            {/* Mobile-only Stage: shown below tagline on mobile (<= 860px), hidden on desktop */}
            <div
              className={`stage stage-mobile${e.slug === "hack-the-hardware" ? " hack-the-hardware" : ""}`}
              style={{ ["--i" as string]: 1 }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <div className="imgwrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={(img) => {
                    // handles images already cached before hydration
                    if (img?.complete && img.naturalWidth > 0) setImgLoaded(true);
                  }}
                  className={`heroimg${imgLoaded ? " loaded" : ""}`}
                  src={imgSrc}
                  alt={`${e.name} – Technex 2k26`}
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => {
                    if (!imgFailed) {
                      setImgFailed(true);
                      setImgLoaded(false);
                    }
                  }}
                />
              </div>
              <div className="shade" />
              <div className="glow" />
              <div className="sweep" />
              <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
            </div>

            {/* Mobile-only Head-actions: shown below stage on mobile (<= 860px), hidden on desktop */}
            <div className="head-actions head-actions-mobile">
              {e.registerUrl ? (
                e.registerUrl.startsWith("/") ? (
                  <Link className="btn gold register-refined" href={e.registerUrl}>
                    Register now <span className="register-arrow" aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <a className="btn gold register-refined" href={e.registerUrl} target="_blank" rel="noreferrer">Register now <span className="register-arrow" aria-hidden="true">↗</span></a>
                )
              ) : (
                <span className="btn gold register-refined" aria-disabled="true">Registration TBA</span>
              )}
              {e.slug === "hackathon" && (
                <div className="collaboration">
                  <span>In collaboration with</span>
                  <div className="collaboration-logo-wrap">
                    <Image
                      src="/assets/events/csi-svpcet.png"
                      alt="Computer Society of India, SVPCET"
                      width={88}
                      height={88}
                      className="ev-out-csi collaboration-logo"
                    />
                  </div>
                  <strong>Computer Society of India</strong>
                </div>
              )}
            </div>
          </div>

          <div className="headright">
            <div className="ghost">
              <b>{"//"}{e.number}</b>
              <span>“{e.quote}”</span>
            </div>
            <div className="head-actions">
              {e.registerUrl ? (
                e.registerUrl.startsWith("/") ? (
                  <Link className="btn gold register-refined" href={e.registerUrl}>
                    Register now <span className="register-arrow" aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <a className="btn gold register-refined" href={e.registerUrl} target="_blank" rel="noreferrer">Register now <span className="register-arrow" aria-hidden="true">↗</span></a>
                )
              ) : (
                <span className="btn gold register-refined" aria-disabled="true">Registration TBA</span>
              )}
              {e.slug === "hackathon" && (
                <div className="collaboration">
                  <span>In collaboration with</span>
                  <div className="collaboration-logo-wrap">
                    <Image
                      src="/assets/events/csi-svpcet.png"
                      alt="Computer Society of India, SVPCET"
                      width={88}
                      height={88}
                      className="ev-out-csi collaboration-logo"
                    />
                  </div>
                  <strong>Computer Society of India</strong>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="stats">
          {e.stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="ico"><Icon k={s.icon} /></span>
              <div>
                <h3>{s.label}</h3>
                <strong>{s.value}</strong>
                {s.sub && <p>{s.sub}</p>}
              </div>
            </div>
          ))}
        </section>

        <nav
          className="tabs"
          role="tablist"
          aria-label="Event sections"
          style={{ ["--idx" as string]: TABS.indexOf(tab) }}
          onKeyDown={onTabKey}
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              className={tab === t ? "on" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* No fixed height / overflow here: the page scrolls, not the panel */}
        <section className="panel" key={tab} role="tabpanel">
          {tab === "About" && (
            <div className="about">
              <div className="aboutText" style={{ ["--i" as string]: 0 }}>
                <div className="aboutIntro">
                  <h2>About the {e.name}</h2>
                  <p>{e.about}</p>
                </div>

                <div className="chips">
                  {e.domains.map((d) => <span key={d}>{d}</span>)}
                </div>

                {highlights.length > 0 && (
                  <div className="highlights highlights-desktop">
                    {highlights.map((h) => (
                      <div key={h.label}><b>{h.value}</b><span>{h.label}</span></div>
                    ))}
                  </div>
                )}

              </div>

                            {/* Desktop-only Stage in About: visible on desktop (> 860px), hidden on mobile */}
              <div
                className={`stage stage-desktop${e.slug === "hack-the-hardware" ? " hack-the-hardware" : ""}`}
                style={{ ["--i" as string]: 1 }}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
              >
                <div className="imgwrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={(img) => {
                      // handles images already cached before hydration
                      if (img?.complete && img.naturalWidth > 0) setImgLoaded(true);
                    }}
                    className={`heroimg${imgLoaded ? " loaded" : ""}`}
                    src={imgSrc}
                    alt={`${e.name} – Technex 2k26`}
                    draggable={false}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => {
                      if (!imgFailed) {
                        setImgFailed(true);
                        setImgLoaded(false);
                      }
                    }}
                  />
                </div>
                <div className="shade" />
                <div className="glow" />
                <div className="sweep" />
                <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
              </div>
<div className="perks">
                  {perks.length > 0 && (
                    <>
                      <h3>What you get</h3>
                      <ul>{perks.map((p) => <li key={p}>{p}</li>)}</ul>
                    </>
                  )}
                  <p className="who">
                    <strong>Who can join:</strong>{" "}
                    {e.whoCanJoin ?? (e.slug === "hackathon" ? WHO_CAN_JOIN : "Eligibility will be announced.")}
                  </p>
                </div>
            </div>
          )}

          {tab === "Rounds" && (
            <div className="rounds rounds-compact">
              <h2>Rounds &amp; timeline</h2>
              <ol>
                {e.rounds.map((r, i) => (
                  <li key={r.title} style={{ ["--i" as string]: i }}>
                    <span className="dot round-icon"><RoundIcon index={i} /></span>
                    <div className="card">
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      <strong>{r.title}</strong>
                      <p>{r.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tab === "Rule book" && (
            <div className="rules">
              <h2>Rule book</h2>
              <div className="ruleGrid">
                {e.rules.map((r, i) => (
                  <div className="card" key={r.title} style={{ ["--i" as string]: i }}>
                    <strong>{r.title}</strong>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
              {e.rulebookUrl ? (
                <a className="btn line" href={e.rulebookUrl} target="_blank" rel="noreferrer">View full rule book</a>
              ) : (
                <span className="btn line">Rule book coming soon</span>
              )}
            </div>
          )}

          {tab === "Contact" && (
            <div className="contact contact-redesign">
              <h2>Get in touch</h2>
              <a className="official-email" href={`mailto:${OFFICIAL_EMAIL}`}>
                <span className="contact-symbol" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                </span>
                <span className="official-email-text"><span className="contact-eyebrow">OFFICIAL EMAIL</span><strong>{OFFICIAL_EMAIL}</strong></span>
                <span className="contact-open" aria-hidden="true">↗</span>
              </a>
              <div className="coordinator-grid">
                {e.contacts.length === 0 && <p className="contact-empty">Event coordinator details will be announced.</p>}
                {e.contacts.map((c, i) => {
                  const email = c.email?.trim();
                  const phone = c.phone?.trim();
                  const dialable = phone && /\d{7,}/.test(phone.replace(/\D/g, ""));
                  return (
                    <article className="coordinator-card" key={`${c.name}-${i}`} style={{ ["--i" as string]: i }}>
                      <span className="coordinator-index">{String(i + 1).padStart(2, "0")}</span>
                      <strong className="coordinator-name">{c.name}</strong>
                      <span className="coordinator-role">{i === 0 ? "EVENT COORDINATOR" : i === 1 ? "EVENT CO-COORDINATOR" : "EVENT TEAM"}</span>
                      <div className="coordinator-links">
                        {dialable && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="coordinator-link">
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.1 10a16 16 0 0 0 6.9 6.9l1.5-1.9a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/></svg>
                          <span>{phone}</span>
                        </a>}
                        {email ? <a href={`mailto:${email}`} className="coordinator-link">
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                          <span>{email}</span>
                        </a> : <span className="coordinator-link coordinator-email-pending">Email to be announced</span>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "FAQs" && (
            <div className="faqs">
              {e.faqs.map((f, i) => (
                <div className={`faq ${open === i ? "open" : ""}`} key={f.q} style={{ ["--i" as string]: i }}>
                  <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                    {f.q}<em aria-hidden="true">＋</em>
                  </button>
                  <div className="ans"><p>{f.a}</p></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <style jsx global>{`
        html.event-detail-scroll-enabled,
        body.event-detail-scroll-enabled {
          height: auto !important;
          min-height: 100% !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          scroll-behavior: smooth;
        }
        body.event-detail-scroll-enabled .page {
          position: relative !important;
          height: auto !important;
          min-height: 100vh !important;
          max-height: none !important;
          overflow: visible !important;
          padding-bottom: clamp(48px, 7vw, 100px) !important;
        }
        body.event-detail-scroll-enabled .page .panel,
        body.event-detail-scroll-enabled .page .about,
        body.event-detail-scroll-enabled .page .aboutText,
        body.event-detail-scroll-enabled .page .rounds,
        body.event-detail-scroll-enabled .page .rules,
        body.event-detail-scroll-enabled .page .contact,
        body.event-detail-scroll-enabled .page .faqs {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          overscroll-behavior: auto !important;
        }
        body.event-detail-scroll-enabled .page .register-refined {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #24180c !important;
          background: linear-gradient(135deg, #f2d49a 0%, #d5a95f 52%, #bd8740 100%) !important;
          border: 1px solid #f6dfb1 !important;
          border-radius: 10px;
          box-shadow: 0 4px 18px rgba(188, 132, 57, .20), inset 0 1px 0 rgba(255,255,255,.4);
          font-weight: 700;
          letter-spacing: .035em;
          text-decoration: none;
          transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
        }
        body.event-detail-scroll-enabled .page a.register-refined:hover {
          transform: translateY(-2px);
          filter: brightness(1.07);
          box-shadow: 0 8px 26px rgba(188, 132, 57, .32);
        }
        body.event-detail-scroll-enabled .page a.register-refined:focus-visible {
          outline: 2px solid #f7dfaa;
          outline-offset: 4px;
        }
        body.event-detail-scroll-enabled .page span.register-refined {
          opacity: .65;
          cursor: not-allowed;
        }
        /* Responsive page content, without changing the site-wide navbar. */
        body.event-detail-scroll-enabled .page {
          box-sizing: border-box;
          width: min(100%, 1600px);
          margin-inline: auto;
          padding-inline: clamp(16px, 4.5vw, 80px);
          padding-top: max(100px, calc(var(--navbar-height, 76px) + 24px));
        }
        body.event-detail-scroll-enabled .page .head,
        body.event-detail-scroll-enabled .page .headright,
        body.event-detail-scroll-enabled .page .titleblock,
        body.event-detail-scroll-enabled .page .stats,
        body.event-detail-scroll-enabled .page .panel { min-width: 0; }
        body.event-detail-scroll-enabled .page .titleblock h1 {
          overflow-wrap: anywhere;
          font-size: clamp(2rem, 5vw, 5.3rem);
          line-height: 1.12;
        }
        body.event-detail-scroll-enabled .page .about .stage {
          width: 100%;
          max-width: 520px;
          height: auto;
          max-height: 440px;
          aspect-ratio: 1.35 / 1;
          min-width: 0;
          min-height: 0;
          justify-self: center;
          align-self: start;
        }
        body.event-detail-scroll-enabled .page .about .stage .imgwrap,
        body.event-detail-scroll-enabled .page .about .stage .heroimg {
          width: 100%; height: 100%;
        }
        body.event-detail-scroll-enabled .page .about .stage .heroimg {
          object-fit: contain;
        }
        /* Round timeline: icon nodes replace the original plain dots. */
        body.event-detail-scroll-enabled .page .rounds ol {
          list-style: none;
          padding-left: 0;
        }
        body.event-detail-scroll-enabled .page .rounds ol > li {
          min-width: 0;
        }
        body.event-detail-scroll-enabled .page .rounds ol > li .round-icon {
          position: relative;
          z-index: 2;
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 43px !important;
          height: 43px !important;
          min-width: 43px;
          border-radius: 13px !important;
          background: linear-gradient(145deg, #30220f, #14100b) !important;
          border: 1px solid rgba(245, 207, 127, .75) !important;
          color: #f6d58b !important;
          box-shadow: 0 0 0 5px rgba(226, 179, 81, .09), 0 7px 22px rgba(0,0,0,.35) !important;
          transform: none !important;
          margin-inline: auto;
          margin-bottom: 14px;
        }
        body.event-detail-scroll-enabled .page .rounds ol > li .round-icon::before,
        body.event-detail-scroll-enabled .page .rounds ol > li .round-icon::after {
          display: none !important;
        }
        body.event-detail-scroll-enabled .page .rounds ol > li .card {
          box-sizing: border-box;
          height: 100%;
          min-width: 0;
          border-color: rgba(211, 166, 79, .42);
          background: linear-gradient(150deg, rgba(40,30,16,.95), rgba(20,16,12,.95));
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
        }
        body.event-detail-scroll-enabled .page .rounds ol > li .card:hover {
          border-color: rgba(249, 211, 139, .85);
          box-shadow: 0 10px 32px rgba(0,0,0,.25);
          transform: translateY(-3px);
        }
        body.event-detail-scroll-enabled .page .register-refined {
          background: linear-gradient(115deg, #493219 0%, #795329 55%, #a67b3b 100%) !important;
          color: #fff1cc !important;
          border: 1px solid rgba(248, 207, 126, .75) !important;
          border-radius: 12px !important;
          padding: 12px 22px !important;
          box-shadow: inset 0 1px rgba(255,255,255,.13), 0 5px 18px rgba(144,93,28,.24) !important;
        }
        body.event-detail-scroll-enabled .page a.register-refined:hover {
          background: linear-gradient(115deg, #64451f, #a17533) !important;
          box-shadow: 0 8px 26px rgba(195,140,57,.3) !important;
        }
        @media (max-width: 900px) {
          body.event-detail-scroll-enabled .page { padding-top: max(90px, calc(var(--navbar-height, 76px) + 18px)); }
          body.event-detail-scroll-enabled .page .head { flex-wrap: wrap; gap: 18px; }
          body.event-detail-scroll-enabled .page .headright { flex-wrap: wrap; gap: 12px; }
          body.event-detail-scroll-enabled .page .about {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px;
          }
          body.event-detail-scroll-enabled .page .about .stage { max-width: 460px; }
          body.event-detail-scroll-enabled .page .stats { flex-wrap: wrap; }
          body.event-detail-scroll-enabled .page .rounds ol {
            display: flex !important;
            flex-direction: column !important;
            gap: 18px;
            border: 0 !important;
            background: none !important;
          }
          body.event-detail-scroll-enabled .page .rounds ol::before,
          body.event-detail-scroll-enabled .page .rounds ol::after { display: none !important; }
          body.event-detail-scroll-enabled .page .rounds ol > li {
            display: grid !important;
            grid-template-columns: 44px minmax(0, 1fr);
            align-items: start;
            gap: 15px;
            width: 100% !important;
          }
          body.event-detail-scroll-enabled .page .rounds ol > li .round-icon {
            grid-column: 1;
            grid-row: 1;
            margin: 2px 0 0;
            top: auto !important;
            left: auto !important;
            right: auto !important;
          }
          body.event-detail-scroll-enabled .page .rounds ol > li .card {
            grid-column: 2;
            grid-row: 1;
            width: 100%;
          }
        }
        @media (max-width: 600px) {
          body.event-detail-scroll-enabled .page {
            width: 100%;
            padding-inline: 16px;
            padding-top: max(92px, calc(var(--navbar-height, 76px) + 20px));
          }
          body.event-detail-scroll-enabled .page .head { display: flex; flex-direction: column; align-items: stretch; }
          body.event-detail-scroll-enabled .page .headright { display: flex; flex-direction: column; align-items: flex-start; }
          body.event-detail-scroll-enabled .page .titleblock h1 { font-size: clamp(1.8rem, 9vw, 3rem); }
          body.event-detail-scroll-enabled .page .stats { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
          body.event-detail-scroll-enabled .page .stats .stat { min-width: 0; padding: 12px; }
          body.event-detail-scroll-enabled .page .tabs {
            display: flex !important;
            width: 100%;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scroll-snap-type: x proximity;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          body.event-detail-scroll-enabled .page .tabs::-webkit-scrollbar { display: none; }
          body.event-detail-scroll-enabled .page .tabs button {
            flex: 0 0 auto !important;
            min-width: 100px;
            padding: 12px 15px;
            scroll-snap-align: start;
            white-space: nowrap;
          }
          body.event-detail-scroll-enabled .page .panel { width: 100%; box-sizing: border-box; padding: 18px 14px; }
          body.event-detail-scroll-enabled .page .about .stage { max-width: 100%; max-height: 320px; }
          body.event-detail-scroll-enabled .page .ruleGrid { display: grid; grid-template-columns: minmax(0,1fr); }
          body.event-detail-scroll-enabled .page .rounds ol > li { gap: 12px; }
        }

        /* Full-width benefits: two balanced columns on desktop, one on mobile. */
        body.event-detail-scroll-enabled .page .about {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: start;
          gap: clamp(22px, 3vw, 44px);
        }
        body.event-detail-scroll-enabled .page .about > .aboutText,
        body.event-detail-scroll-enabled .page .about > .stage { min-width: 0; }
        body.event-detail-scroll-enabled .page .about > .perks {
          grid-column: 1 / -1;
          width: 100%;
          box-sizing: border-box;
          padding: clamp(20px, 2.5vw, 34px);
          border: 1px solid rgba(226, 183, 102, .27);
          border-radius: 18px;
          background: linear-gradient(125deg, rgba(42,33,23,.56), rgba(14,13,12,.7));
        }
        body.event-detail-scroll-enabled .page .about > .perks h3 {
          color: #f0cf8a;
          margin: 0 0 20px;
          font-size: 1.1rem;
          letter-spacing: .03em;
        }
        body.event-detail-scroll-enabled .page .about > .perks ul {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px clamp(18px, 3vw, 44px);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        body.event-detail-scroll-enabled .page .about > .perks li {
          margin: 0 !important;
          padding: 0 0 0 29px !important;
          position: relative;
          min-width: 0;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }
        body.event-detail-scroll-enabled .page .about > .perks li::before {
          content: '✓';
          position: absolute;
          left: 0;
          top: 0;
          color: #d7e3c0;
          font-weight: 800;
        }
        body.event-detail-scroll-enabled .page .about > .perks .who {
          margin: 24px 0 0;
          padding-top: 18px;
          border-top: 1px solid rgba(226,183,102,.2);
          max-width: none;
          line-height: 1.65;
        }
        /* Match the register CTA used beside Explore in the event experience. */
        body.event-detail-scroll-enabled .page .register-refined {
          --register-cut: 12px;
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          overflow: hidden;
          flex: 0 1 auto;
          width: auto;
          min-width: 220px;
          min-height: 54px;
          padding: 0 8px 0 clamp(12px, 1.3vw, 18px) !important;
          border: 0 !important;
          border-radius: 0 !important;
          clip-path: polygon(
            var(--register-cut) 0,
            100% 0,
            100% calc(100% - var(--register-cut)),
            calc(100% - var(--register-cut)) 100%,
            0 100%,
            0 var(--register-cut)
          ) !important;
          background: linear-gradient(115deg, #fff2d0 0%, #f2cb82 38%, #dba04a 72%, #c68635 100%) !important;
          box-shadow: none !important;
          color: #1f1306 !important;
          font-family: "Redaction 20", sans-serif;
          font-size: clamp(0.8rem, 1vw, 0.98rem);
          font-weight: 700;
          letter-spacing: .16em;
          line-height: 1;
          text-transform: uppercase;
          text-shadow: none;
          text-decoration: none;
          white-space: nowrap;
          transition: transform .26s cubic-bezier(.2, .8, .2, 1), color .26s ease, background .26s ease;
        }
        body.event-detail-scroll-enabled .page .register-refined::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(110deg, transparent 35%, rgba(255, 255, 255, .5) 50%, transparent 65%);
          transform: translateX(-130%) skewX(-18deg);
          transition: transform .7s ease;
        }
        body.event-detail-scroll-enabled .page .register-cta-text {
          position: relative;
          -webkit-text-stroke: 0;
        }
        body.event-detail-scroll-enabled .page .register-arrow {
          display: grid;
          place-items: center;
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #1f1306;
          color: #f6dfb4;
        }
        body.event-detail-scroll-enabled .page .register-arrow svg {
          width: 14px;
          height: 14px;
          transition: transform .26s ease;
        }
        body.event-detail-scroll-enabled .page a.register-refined:hover {
          transform: translateY(-3px);
          background: linear-gradient(115deg, #fff9e8 0%, #f8d890 38%, #ebb259 72%, #d9953d 100%) !important;
          color: #1f1306 !important;
        }
        body.event-detail-scroll-enabled .page a.register-refined:hover::before {
          transform: translateX(130%) skewX(-18deg);
        }
        body.event-detail-scroll-enabled .page a.register-refined:hover .register-arrow svg {
          transform: translateX(3px);
        }
        body.event-detail-scroll-enabled .page a.register-refined:active {
          transform: translateY(-1px) scale(.985);
        }
        @media (max-width: 600px) {
          body.event-detail-scroll-enabled .page .register-refined { min-width: 200px; }
        }
        @media (max-width: 900px) {
          body.event-detail-scroll-enabled .page .about { grid-template-columns: minmax(0,1fr) !important; }
          body.event-detail-scroll-enabled .page .about > .perks { grid-column: 1; }
        }
        @media (max-width: 600px) {
          body.event-detail-scroll-enabled .page .about > .perks ul { grid-template-columns: minmax(0,1fr); }
          body.event-detail-scroll-enabled .page .about > .perks { padding: 20px 16px; }
        }

        /* Contact: official mailbox + coordinator cards */
        body.event-detail-scroll-enabled .page .contact-redesign { width: 100%; min-width: 0; }
        body.event-detail-scroll-enabled .page .official-email {
          display: flex; align-items: center; gap: 18px; width: 100%; box-sizing: border-box;
          margin: 18px 0 24px; padding: 20px 24px; text-decoration: none;
          border: 1px solid rgba(226, 169, 84, .48); border-radius: 16px;
          background: linear-gradient(110deg, rgba(73, 35, 18, .85), rgba(40, 21, 18, .76) 55%, rgba(27, 19, 17, .9));
          box-shadow: inset 0 1px 0 rgba(255, 219, 155, .09);
          color: #f5dfb1; transition: border-color .2s ease, transform .2s ease;
        }
        body.event-detail-scroll-enabled .page .official-email:hover { border-color: #f2ca7c; transform: translateY(-2px); }
        body.event-detail-scroll-enabled .page .contact-symbol {
          display: grid; place-items: center; flex: 0 0 56px; height: 56px;
          border-radius: 16px; background: rgba(20, 13, 8, .52); color: #f0b94e;
          border: 1px solid rgba(235, 181, 88, .23);
        }
        body.event-detail-scroll-enabled .page .official-email-text { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        body.event-detail-scroll-enabled .page .contact-eyebrow { font-size: .78rem; letter-spacing: .16em; font-weight: 750; color: #c7aa7a; }
        body.event-detail-scroll-enabled .page .official-email-text strong { font-size: clamp(1rem, 2vw, 1.3rem); overflow-wrap: anywhere; }
        body.event-detail-scroll-enabled .page .contact-open { margin-left: auto; font-size: 1.5rem; }
        body.event-detail-scroll-enabled .page .coordinator-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        body.event-detail-scroll-enabled .page .coordinator-card {
          position: relative; min-width: 0; padding: 22px; border-radius: 16px;
          background: linear-gradient(145deg, rgba(36, 29, 20, .96), rgba(18, 17, 16, .96));
          border: 1px solid rgba(218, 173, 96, .34);
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        body.event-detail-scroll-enabled .page .coordinator-card:hover { transform: translateY(-3px); border-color: rgba(240, 197, 111, .8); box-shadow: 0 12px 26px rgba(0, 0, 0, .24); }
        body.event-detail-scroll-enabled .page .coordinator-index { position: absolute; right: 20px; top: 18px; color: #b38b50; font-size: .78rem; letter-spacing: .12em; }
        body.event-detail-scroll-enabled .page .coordinator-name { display: block; padding-right: 38px; font-size: clamp(1.1rem, 2vw, 1.4rem); color: #f0d6a0; overflow-wrap: anywhere; }
        body.event-detail-scroll-enabled .page .coordinator-role { display: block; margin-top: 5px; color: #b5a99a; font-size: .77rem; letter-spacing: .11em; font-weight: 750; }
        body.event-detail-scroll-enabled .page .coordinator-links { display: flex; flex-direction: column; gap: 13px; margin-top: 22px; }
        body.event-detail-scroll-enabled .page .coordinator-link { display: flex; align-items: flex-start; gap: 11px; min-width: 0; color: #e3d9c8; text-decoration: none; line-height: 1.45; transition: color .2s ease; }
        body.event-detail-scroll-enabled .page .coordinator-link svg { flex-shrink: 0; margin-top: 2px; color: #e4ad4f; }
        body.event-detail-scroll-enabled .page .coordinator-link span { min-width: 0; overflow-wrap: anywhere; }
        body.event-detail-scroll-enabled .page .coordinator-link:hover { color: #f4c978; }
        body.event-detail-scroll-enabled .page .contact-empty { grid-column: 1 / -1; color: #cbbda6; }
        @media (max-width: 680px) {
          body.event-detail-scroll-enabled .page .coordinator-grid { grid-template-columns: minmax(0, 1fr); }
          body.event-detail-scroll-enabled .page .official-email { padding: 16px; gap: 12px; }
          body.event-detail-scroll-enabled .page .contact-symbol { flex-basis: 44px; height: 44px; border-radius: 12px; }
          body.event-detail-scroll-enabled .page .contact-symbol svg { width: 22px; height: 22px; }
          body.event-detail-scroll-enabled .page .coordinator-card { padding: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          html.event-detail-scroll-enabled { scroll-behavior: auto; }
          body.event-detail-scroll-enabled .page .register-refined { transition: none; }
        }

        /* Overview category label, shared by all event detail pages */
        body.event-detail-scroll-enabled .page .event-category-tag {
          display: inline-flex; align-items: center; width: fit-content;
          max-width: 100%; padding: 5px 13px; margin-bottom: 5px;
          background: linear-gradient(110deg, #f7df9d, #dfb45b);
          color: #241808; border: 1px solid #f5d28a; border-radius: 3px;
          font-size: 12px; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; line-height: 1.3;
        }
        body.event-detail-scroll-enabled .page .coordinator-email-pending {
          opacity: .65; cursor: default; overflow-wrap: anywhere;
        }

        /* Compact, content-sized timeline: no cards escaping the outer panel. */
        body.event-detail-scroll-enabled .page .rounds-compact {
          width: 100%; min-width: 0; box-sizing: border-box;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 245px), 1fr)) !important;
          align-items: stretch !important;
          gap: 16px !important;
          width: 100% !important;
          margin: 18px 0 0 !important;
          padding: 0 !important;
          border: 0 !important;
          background: none !important;
          list-style: none !important;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol::before,
        body.event-detail-scroll-enabled .page .rounds-compact ol::after {
          display: none !important;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li {
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
          width: auto !important;
          min-width: 0 !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          transform: none !important;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li .round-icon {
          position: relative !important;
          inset: auto !important;
          flex: none !important;
          width: 38px !important;
          height: 38px !important;
          min-width: 38px !important;
          margin: 0 0 0 12px !important;
          border-radius: 11px !important;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li .card {
          position: relative !important;
          inset: auto !important;
          box-sizing: border-box !important;
          flex: 1 1 auto !important;
          width: 100% !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 16px 17px !important;
          border-radius: 13px !important;
          overflow-wrap: anywhere;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li .card strong {
          display: block;
          font-size: clamp(15px, 1.15vw, 18px);
          line-height: 1.35;
          margin: 8px 0 5px;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li .card p {
          font-size: clamp(13px, 1vw, 15px);
          line-height: 1.5;
          margin: 0 !important;
        }
        /* Decorative timeline rail: continuous gold track behind the icon nodes. */
        body.event-detail-scroll-enabled .page .rounds-compact ol {
          position: relative !important;
          isolation: isolate;
          padding-top: 0 !important;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol::before {
          content: "" !important;
          display: block !important;
          position: absolute !important;
          z-index: 0 !important;
          left: 31px !important;
          right: 31px !important;
          top: 19px !important;
          height: 3px !important;
          border: 0 !important;
          border-radius: 999px !important;
          background: linear-gradient(90deg, #a56e25 0%, #f7d889 20%, #b57d30 43%, #ffe5a0 68%, #a56e25 100%) !important;
          box-shadow: 0 0 14px rgba(236,185,77,.25), 0 1px 0 rgba(255,239,180,.22) !important;
          pointer-events: none;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol::after {
          content: "" !important;
          display: block !important;
          position: absolute !important;
          z-index: 0 !important;
          left: 31px !important;
          right: 31px !important;
          top: 26px !important;
          height: 1px !important;
          background: repeating-linear-gradient(90deg, rgba(226,177,83,.65) 0 7px, transparent 7px 16px) !important;
          opacity: .8;
          pointer-events: none;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li {
          z-index: 1;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li .round-icon {
          z-index: 2 !important;
          box-shadow: 0 0 0 5px #161109, 0 0 0 6px rgba(229,180,85,.36), 0 0 22px rgba(233,180,70,.18) !important;
        }
        body.event-detail-scroll-enabled .page .rounds-compact ol > li .round-icon::after {
          content: "" !important;
          display: block !important;
          position: absolute !important;
          bottom: -9px;
          left: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #eac16d;
          transform: translateX(-50%);
          box-shadow: 0 0 9px rgba(239,193,100,.7);
        }
        @media (max-width: 600px) {
          body.event-detail-scroll-enabled .page .rounds-compact ol {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 14px !important;
          }
          body.event-detail-scroll-enabled .page .rounds-compact ol::before {
            left: 19px !important;
            right: auto !important;
            top: 19px !important;
            bottom: 19px !important;
            width: 3px !important;
            height: auto !important;
            background: linear-gradient(180deg, #f7d889, #ad792e 45%, #f7d889 80%, #ad792e) !important;
          }
          body.event-detail-scroll-enabled .page .rounds-compact ol::after {
            left: 26px !important;
            right: auto !important;
            top: 19px !important;
            bottom: 19px !important;
            width: 1px !important;
            height: auto !important;
            background: repeating-linear-gradient(180deg, rgba(226,177,83,.65) 0 7px, transparent 7px 16px) !important;
          }
          body.event-detail-scroll-enabled .page .rounds-compact ol > li {
            display: grid !important;
            grid-template-columns: 38px minmax(0, 1fr) !important;
            align-items: start !important;
            gap: 10px !important;
          }
          body.event-detail-scroll-enabled .page .rounds-compact ol > li .round-icon {
            grid-column: 1; grid-row: 1; margin: 3px 0 0 !important;
          }
          body.event-detail-scroll-enabled .page .rounds-compact ol > li .card {
            grid-column: 2; grid-row: 1; padding: 14px !important;
          }
        }
      
        /* Desktop specific visibility rules */
        @media (min-width: 861px) {
          body.event-detail-scroll-enabled .page .stage.stage-mobile,
          body.event-detail-scroll-enabled .page .head-actions-mobile {
            display: none !important;
          }
          body.event-detail-scroll-enabled .page .headright {
            display: flex !important;
          }
          body.event-detail-scroll-enabled .page .stage.stage-desktop {
            display: block !important;
          }
          body.event-detail-scroll-enabled .page .highlights.highlights-desktop {
            display: grid !important;
          }
        }

        /* Mobile specific overrides (<= 860px) */
        @media (max-width: 860px) {
          body.event-detail-scroll-enabled .page .stage-desktop,
          body.event-detail-scroll-enabled .page .highlights-desktop,
          body.event-detail-scroll-enabled .page .headright {
            display: none !important;
          }

          body.event-detail-scroll-enabled .page .event-category-tag {
            order: -3 !important;
          }

          body.event-detail-scroll-enabled .page .titleblock h1 {
            order: -2 !important;
          }

          body.event-detail-scroll-enabled .page .titleblock p.tag {
            order: -1 !important;
          }

          body.event-detail-scroll-enabled .page .stage.stage-mobile {
            order: 0 !important;
            display: block !important;
            width: min(100%, 480px) !important;
            min-height: 240px !important;
            max-height: 380px !important;
            aspect-ratio: 621 / 515 !important;
            margin: 14px 0 16px !important;
            border-radius: 12px !important;
            overflow: hidden !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile {
            order: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            width: min(100%, 480px) !important;
            margin-bottom: 12px !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .register-refined,
          body.event-detail-scroll-enabled .page .btn.gold.register-refined {
            width: 100% !important;
            min-width: 0 !important;
            text-align: center !important;
            justify-content: center !important;
            padding: 14px 28px !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .collaboration,
          body.event-detail-scroll-enabled .page .collaboration {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            margin-inline: auto !important;
          }

          body.event-detail-scroll-enabled .page .collaboration-logo-wrap {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            margin: 4px auto !important;
            text-align: center !important;
          }

          body.event-detail-scroll-enabled .page .collaboration-logo,
          body.event-detail-scroll-enabled .page .collaboration img {
            display: block !important;
            margin: 0 auto !important;
            align-self: center !important;
            text-align: center !important;
          }

          body.event-detail-scroll-enabled .page .collaboration > span,
          body.event-detail-scroll-enabled .page .collaboration strong {
            display: block !important;
            text-align: center !important;
            width: 100% !important;
            margin-inline: auto !important;
          }

          /* Small Back Button on Mobile */
          body.event-detail-scroll-enabled .page button.back-events,
          body.event-detail-scroll-enabled .page .back-events.btn,
          body.event-detail-scroll-enabled .page .back-events {
            align-self: flex-start !important;
            flex: none !important;
            padding: 6px 14px !important;
            font-size: 0.72rem !important;
            font-weight: 700 !important;
            letter-spacing: 0.08em !important;
            border-radius: 6px !important;
            clip-path: none !important;
            line-height: 1.3 !important;
          }

          /* Small Category Tag on Mobile */
          body.event-detail-scroll-enabled .page .event-category-tag {
            display: inline-flex !important;
            align-items: center !important;
            width: fit-content !important;
            max-width: 100% !important;
            padding: 3px 9px !important;
            margin-bottom: 6px !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            letter-spacing: 0.1em !important;
            line-height: 1.25 !important;
            border-radius: 4px !important;
          }

          /* Single-column Header & Titleblock on Mobile */
          body.event-detail-scroll-enabled .page .head {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            width: 100% !important;
          }

          body.event-detail-scroll-enabled .page .titleblock {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          /* Single-column Stats Cards on Mobile */
          body.event-detail-scroll-enabled .page .stats {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }
          body.event-detail-scroll-enabled .page .stat {
            padding: 12px 14px !important;
            gap: 14px !important;
            display: flex !important;
            align-items: flex-start !important;
          }
          body.event-detail-scroll-enabled .page .stat .ico {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            margin-top: 2px !important;
          }
          body.event-detail-scroll-enabled .page .stat .ico svg {
            width: 20px !important;
            height: 20px !important;
          }
          body.event-detail-scroll-enabled .page .stat h3 {
            font-size: 0.68rem !important;
            letter-spacing: 0.08em !important;
            margin-bottom: 2px !important;
          }
          body.event-detail-scroll-enabled .page .stat strong {
            font-size: 0.95rem !important;
            line-height: 1.3 !important;
          }
          body.event-detail-scroll-enabled .page .stat p {
            font-size: 0.78rem !important;
            line-height: 1.4 !important;
            margin-top: 3px !important;
          }

          /* Mobile Tabs Horizontal Scrollbar */
          body.event-detail-scroll-enabled .page .tabs {
            overflow-x: auto !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(227, 185, 92, 0.7) rgba(20, 15, 10, 0.8) !important;
            padding-bottom: 7px !important;
          }
          body.event-detail-scroll-enabled .page .tabs::-webkit-scrollbar {
            height: 4px !important;
            display: block !important;
          }
          body.event-detail-scroll-enabled .page .tabs::-webkit-scrollbar-thumb {
            background: linear-gradient(90deg, #c9983e, #f7d889) !important;
            border-radius: 999px !important;
          }

          /* Reduced Domain Pills in About on Mobile */
          body.event-detail-scroll-enabled .page .chips span {
            padding: 3px 9px !important;
            font-size: 0.7rem !important;
            letter-spacing: 0.04em !important;
            border-radius: 99px !important;
          }

          /* Single-column About on Mobile */
          body.event-detail-scroll-enabled .page .about {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 20px !important;
          }

          /* Compact Contact Block on Mobile */
          body.event-detail-scroll-enabled .page .official-email {
            padding: 12px 18px !important;
            margin: 12px 0 16px !important;
          }
          body.event-detail-scroll-enabled .page .contact-symbol {
            flex: 0 0 40px !important;
            height: 40px !important;
          }
          body.event-detail-scroll-enabled .page .coordinator-card {
            padding: 14px 16px !important;
          }

          /* Metal Mania Font on Mobile */
          body.event-detail-scroll-enabled .page .tabs button,
          body.event-detail-scroll-enabled .page .panel h2,
          body.event-detail-scroll-enabled .page .panel h3,
          body.event-detail-scroll-enabled .page .perks h3,
          body.event-detail-scroll-enabled .page .perks .who strong {
            font-family: var(--font-metal-mania), "Metal Mania", cursive, sans-serif !important;
          }

          body.event-detail-scroll-enabled .page .tabs button {
            font-size: 0.95rem !important;
            font-weight: 400 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
          }

          body.event-detail-scroll-enabled .page .panel h2 {
            font-size: 1.35rem !important;
            font-weight: 400 !important;
            letter-spacing: 0.06em !important;
            text-transform: uppercase !important;
            color: var(--gold-hi) !important;
          }

          body.event-detail-scroll-enabled .page .panel h3,
          body.event-detail-scroll-enabled .page .perks h3 {
            font-size: 1.05rem !important;
            font-weight: 400 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            color: var(--gold) !important;
          }

          body.event-detail-scroll-enabled .page .perks .who strong {
            font-size: 0.96rem !important;
            font-weight: 400 !important;
            letter-spacing: 0.05em !important;
            color: var(--gold-hi) !important;
          }

          /* Redaction 20 on Mobile for Questions and Rules */
          body.event-detail-scroll-enabled .page .faq button,
          body.event-detail-scroll-enabled .page .faq .ans,
          body.event-detail-scroll-enabled .page .card strong,
          body.event-detail-scroll-enabled .page .rounds ol > li .card strong,
          body.event-detail-scroll-enabled .page .rules .card strong,
          body.event-detail-scroll-enabled .page .rules .card p,
          body.event-detail-scroll-enabled .page .btn.line {
            font-family: var(--font-redaction), "Redaction 20", system-ui, sans-serif !important;
          }

          body.event-detail-scroll-enabled .page .faq button {
            font-weight: 700 !important;
            font-size: 0.94rem !important;
            letter-spacing: 0.02em !important;
          }

          body.event-detail-scroll-enabled .page .card strong {
            font-weight: 700 !important;
            letter-spacing: 0.03em !important;
          }
        }
      `}</style>
    </>
  );
}
