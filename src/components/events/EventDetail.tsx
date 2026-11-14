"use client";
import { Fragment, useEffect, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EVENT_LIST_SCROLL_KEY } from "@/constants/events";
import type { EventItem, IconKind } from "@/types/event";
import TerrainBackground from "./TerrainBackground";

const BASE_TABS = ["About", "Rounds", "Rule book", "Contact", "FAQs"] as const;
type BaseTab = (typeof BASE_TABS)[number];
type Tab = BaseTab | "Sponsors";

interface SponsorItem {
  name: string;
  role: string;
  logo?: string;
  status?: string;
  theme?: "dark" | "light";
}

const APEX_PLATFORM_PARTNER = {
  name: "CTF7",
  title: "CTF7 — Platform Partner",
  role: "Official Platform Partner",
  badge: "Special Mention",
  logo: "/assets/events/sponsors/ctf7-partner-v2.webp?v=2",
  description:
    "CTF7 is an advanced, enterprise-grade cybersecurity competition platform designed for hosting scalable Capture The Flag events. Featuring dynamic real-time scoring, containerized challenge deployment, anti-cheat monitoring, and automated flag verification, CTF7 powers APEX CTF to provide participants with an authentic, high-octane competitive hacking experience.",
};

const APEX_SPONSORS: SponsorItem[] = [
  {
    name: "TryHackMe",
    role: "Cybersecurity Training Partner",
    logo: "/assets/events/sponsors/tryhackme-v2.webp?v=2",
    theme: "light",
  },
  {
    name: ".xyz",
    role: "Official Domains Partner",
    logo: "/assets/events/sponsors/xyz-v2.webp?v=2",
    theme: "light",
  },
  {
    name: "ThunderCipher",
    role: "Cybersecurity Sponsor",
    logo: "/assets/events/sponsors/thundercipher-v2.webp?v=2",
    theme: "dark",
  },
  {
    name: "Campfire Security",
    role: "Security Partner & Sponsor",
    logo: "/assets/events/sponsors/campfire-security-v2.webp?v=2",
    theme: "light",
  },
  {
    name: "Abakus",
    role: "Technology Sponsor",
    logo: "/assets/events/sponsors/abakus-technologies-v2.webp?v=2",
    theme: "light",
  },
  {
    name: "Semi Electronic",
    role: "Official Sponsor",
    status: "[Logo to be attached]",
  },
  {
    name: "Unilogy",
    role: "Official Sponsor",
    status: "[Logo to be attached]",
  },
];

const APEX_DISCORD_SERVER = {
  name: "APEX CTF Discord Server",
  statusNotice: "Coming soon",
  description:
    "The official communication hub for APEX CTF. Connect with participants, get real-time hint releases, live challenge updates, and direct coordinator support.",
};

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

  const isApexCtf = e.slug === "ctf" || e.slug === "apex-ctf";
  const hasCollab = e.slug === "hackathon" || isApexCtf;
  const tabs: Tab[] = isApexCtf ? [...BASE_TABS, "Sponsors"] : [...BASE_TABS];

  useEffect(() => {
    document.documentElement.classList.add("event-detail-scroll-enabled");
    document.body.classList.add("event-detail-scroll-enabled");
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qTab = params.get("tab");
      if (qTab && tabs.includes(qTab as Tab)) {
        setTab(qTab as Tab);
      }
    }
    return () => {
      document.documentElement.classList.remove("event-detail-scroll-enabled");
      document.body.classList.remove("event-detail-scroll-enabled");
    };
  }, [tabs]);
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
    const i = tabs.indexOf(tab);
    if (i === -1) return;
    if (ev.key === "ArrowRight") setTab(tabs[(i + 1) % tabs.length]);
    else if (ev.key === "ArrowLeft") setTab(tabs[(i - 1 + tabs.length) % tabs.length]);
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
        <div className="top-bar">
          <button className="btn line back-events" type="button" onClick={backToEvents}>
            {backLabel}
          </button>
          <div className="ghost" aria-hidden="true">
            <b>{"//"}{e.number}</b>
            <span>“{e.quote}”</span>
          </div>
        </div>

        <header className={`head ${hasCollab ? "has-collab" : "no-collab"}`}>
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
                <div className="collaboration collaboration-mobile-row">
                  <div className="collaboration-logo-wrap">
                    <Image
                      src="/assets/events/csi-svpcet.png"
                      alt="Computer Society of India, SVPCET"
                      width={52}
                      height={52}
                      className="collaboration-logo"
                    />
                  </div>
                  <div className="collaboration-text">
                    <span>In collaboration with</span>
                    <strong>Computer Society of India</strong>
                  </div>
                </div>
              )}
              {(e.slug === "ctf" || e.slug === "apex-ctf") && (
                <div className="collaboration collaboration-mobile-row">
                  <div className="collaboration-logo-wrap">
                    <Image
                      src="/assets/events/acm-svpcet.webp"
                      alt="ACM SVPCET Student Chapter"
                      width={52}
                      height={52}
                      className="collaboration-logo acm-logo"
                    />
                  </div>
                  <div className="collaboration-text">
                    <span>In collaboration with</span>
                    <strong>ACM SVPCET Student Chapter</strong>
                  </div>
                </div>
              )}
              {isApexCtf && (
                <button
                  type="button"
                  className="mobile-sponsors-quickjump-btn"
                  onClick={() => setTab("Sponsors")}
                  aria-label="View official sponsors and platform partner"
                >
                  <span className="sparkle-gold" aria-hidden="true">★</span> View APEX CTF Sponsors &amp; Partners
                </button>
              )}
            </div>
          </div>

          {/* Desktop Column 3: Register button directly on top of Team Size block */}
          <div className="head-col-reg">
            {e.registerUrl ? (
              e.registerUrl.startsWith("/") ? (
                <Link className="btn gold register-refined" href={e.registerUrl}>
                  Register now <span className="register-arrow" aria-hidden="true">↗</span>
                </Link>
              ) : (
                <a className="btn gold register-refined" href={e.registerUrl} target="_blank" rel="noreferrer">
                  Register now <span className="register-arrow" aria-hidden="true">↗</span>
                </a>
              )
            ) : (
              <span className="btn gold register-refined" aria-disabled="true">
                Registration TBA
              </span>
            )}
          </div>

          {/* Desktop Column 4: Collaboration block directly on top of Prize Pool block */}
          {hasCollab && (
            <div className="head-col-collab">
              {e.slug === "hackathon" && (
                <div className="collaboration">
                  <div className="collaboration-logo-wrap">
                    <Image
                      src="/assets/events/csi-svpcet.png"
                      alt="Computer Society of India, SVPCET"
                      width={68}
                      height={68}
                      className="collaboration-logo"
                    />
                  </div>
                  <div className="collaboration-text">
                    <span>In collaboration with</span>
                    <strong>Computer Society of India</strong>
                  </div>
                </div>
              )}
              {(e.slug === "ctf" || e.slug === "apex-ctf") && (
                <div className="collaboration">
                  <div className="collaboration-logo-wrap">
                    <Image
                      src="/assets/events/acm-svpcet.webp"
                      alt="ACM SVPCET Student Chapter"
                      width={68}
                      height={68}
                      className="collaboration-logo acm-logo"
                    />
                  </div>
                  <div className="collaboration-text">
                    <span>In collaboration with</span>
                    <strong>ACM SVPCET Student Chapter</strong>
                  </div>
                </div>
              )}
            </div>
          )}
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
          style={{ ["--idx" as string]: tabs.indexOf(tab) }}
          onKeyDown={onTabKey}
        >
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              className={`${tab === t ? "on" : ""} ${t === "Sponsors" ? "tab-sponsors-highlight" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "Sponsors" ? (
                <span className="sponsors-tab-btn-content">
                  <span className="sponsors-sparkle" aria-hidden="true">★</span> Sponsors
                </span>
              ) : (
                t
              )}
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
                      <div className="round-text">
                        {r.text.split("\n\n").map((para, pIdx) => (
                          <p key={pIdx}>
                            {para.split("\n").map((line, lIdx, arr) => (
                              <Fragment key={lIdx}>
                                {line}
                                {lIdx < arr.length - 1 && <br />}
                              </Fragment>
                            ))}
                          </p>
                        ))}
                      </div>
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

          {tab === "Sponsors" && isApexCtf && (
            <div className="sponsors-view">
              <div className="sponsors-header">
                <div className="sponsors-tag">Official Partners &amp; Sponsors</div>
                <h2>Our Sponsors &amp; Platform Partner</h2>
                <p>
                  APEX CTF in association with <strong>ACM Student Chapter, SVPCET</strong> is proudly supported by leading cybersecurity organizations, platforms, and industry innovators.
                </p>
              </div>

              {/* Platform Partner (Special Mention) */}
              <div className="platform-partner-banner">
                <div className="partner-badge-glow">Special Mention</div>
                <div className="partner-card-body">
                  <div className="partner-logo-box dark-logo">
                    <Image
                      src={APEX_PLATFORM_PARTNER.logo}
                      alt={APEX_PLATFORM_PARTNER.name}
                      width={120}
                      height={90}
                      className="partner-logo-img"
                      unoptimized
                    />
                  </div>
                  <div className="partner-info">
                    <div className="partner-role-badge">Official Platform Partner</div>
                    <h3>{APEX_PLATFORM_PARTNER.title}</h3>
                    <p>{APEX_PLATFORM_PARTNER.description}</p>
                  </div>
                </div>
              </div>

              {/* Sponsors Section */}
              <div className="sponsors-section">
                <div className="section-title-wrap">
                  <h3>Event Sponsors</h3>
                  <span>Empowering the next generation of cybersecurity talent &amp; competitive hackers</span>
                </div>
                <div className="sponsors-grid">
                  {APEX_SPONSORS.map((s) => (
                    <div key={s.name} className="sponsor-card">
                      {s.logo ? (
                        <div className={`sponsor-logo-frame ${s.theme === "dark" ? "dark-theme" : "light-theme"}`}>
                          <Image
                            src={s.logo}
                            alt={s.name}
                            width={140}
                            height={80}
                            className="sponsor-img"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="sponsor-logo-frame placeholder-frame">
                          <span className="sponsor-initial">{s.name.charAt(0)}</span>
                          <span className="sponsor-pending-label">[Logo to be attached]</span>
                        </div>
                      )}
                      <div className="sponsor-meta">
                        <h4>{s.name}</h4>
                        <span className="sponsor-role">{s.role}</span>
                        {s.status && <span className="sponsor-status-tag">{s.status}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dedicated Discord Server Section */}
              <div className="discord-server-section">
                <div className="discord-card-inner">
                  <div className="discord-brand-icon">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" aria-hidden="true">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                  <div className="discord-content-col">
                    <div className="discord-header-row">
                      <span className="discord-community-pill">Community Hub</span>
                      <span className="discord-status-pill">Coming Soon</span>
                    </div>
                    <h3>{APEX_DISCORD_SERVER.name}</h3>
                    <p>{APEX_DISCORD_SERVER.description}</p>
                   
                    <div className="discord-action-box">
                      <div className="discord-link-badge">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span>{APEX_DISCORD_SERVER.statusNotice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          body.event-detail-scroll-enabled .page .head-col-reg,
          body.event-detail-scroll-enabled .page .head-col-collab {
            display: flex !important;
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
          body.event-detail-scroll-enabled .page .head-col-reg,
          body.event-detail-scroll-enabled .page .head-col-collab {
            display: none !important;
          }
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

          body.event-detail-scroll-enabled .page .head-actions-mobile .collaboration.collaboration-mobile-row {
            width: 100% !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 14px !important;
            padding: 10px 16px !important;
            box-sizing: border-box !important;
            background: linear-gradient(120deg, rgba(227,185,92,.12), rgba(227,185,92,.04)) !important;
            border: 1px solid var(--line) !important;
            border-radius: 12px !important;
            text-align: left !important;
            margin: 0 !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .collaboration-mobile-row .collaboration-logo-wrap {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 48px !important;
            height: 48px !important;
            max-width: 48px !important;
            max-height: 48px !important;
            border-radius: 50% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            margin: 0 !important;
            flex: 0 0 48px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .collaboration-mobile-row .collaboration-text {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 2px !important;
            flex: 1 !important;
            min-width: 0 !important;
            text-align: left !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .collaboration-mobile-row .collaboration-text span {
            font-size: 0.62rem !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            color: var(--muted) !important;
            margin: 0 !important;
            text-align: left !important;
            display: block !important;
            line-height: 1.2 !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .collaboration-mobile-row .collaboration-text strong {
            font-size: 0.88rem !important;
            color: var(--gold-hi) !important;
            line-height: 1.25 !important;
            margin: 0 !important;
            text-align: left !important;
            display: block !important;
            font-weight: 700 !important;
          }

          body.event-detail-scroll-enabled .page .head-actions-mobile .mobile-sponsors-quickjump-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            width: 100% !important;
            padding: 10px 16px !important;
            background: linear-gradient(135deg, rgba(30, 24, 16, 0.8), rgba(20, 16, 10, 0.95)) !important;
            border: 1px solid rgba(227, 185, 92, 0.4) !important;
            border-radius: 10px !important;
            color: var(--gold-hi) !important;
            font-family: var(--font-redaction), "Redaction 20", sans-serif !important;
            font-size: 0.82rem !important;
            font-weight: 700 !important;
            letter-spacing: 0.04em !important;
            cursor: pointer !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 0 12px rgba(227, 185, 92, 0.12) !important;
            box-sizing: border-box !important;
          }

          body.event-detail-scroll-enabled .page .sparkle-gold {
            color: #ffd885 !important;
            font-size: 0.95rem !important;
          }

          body.event-detail-scroll-enabled .page .rounds ol > li .card .round-text p {
            line-height: 1.65 !important;
            margin-bottom: 0.65rem !important;
          }
          body.event-detail-scroll-enabled .page .rounds ol > li .card .round-text p:last-child {
            margin-bottom: 0 !important;
          }

          body.event-detail-scroll-enabled .page .collaboration-logo-wrap .collaboration-logo,
          body.event-detail-scroll-enabled .page .collaboration-logo-wrap img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            object-fit: contain !important;
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
