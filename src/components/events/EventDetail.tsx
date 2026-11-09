"use client";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { EVENT_LIST_SCROLL_KEY } from "@/constants/events";
import type { EventItem, IconKind } from "@/types/event";
import TerrainBackground from "./TerrainBackground";


const TABS = ["About", "Rounds", "Rule book", "Contact", "FAQs"] as const;
type Tab = (typeof TABS)[number];

// Edit these to match your real event details
const HIGHLIGHTS = [
  { value: "24 hrs", label: "Non-stop building" },
  { value: "2–4", label: "Members per team" },
  { value: "₹70K+", label: "Prize pool" },
];

const PERKS = [
  "Mentor guidance from industry experts and faculty",
  "Food, refreshments and workspace for all 24 hours",
  "Certificates for every participant",
  "Goodies, swag and cash prizes for winners",
];

const WHO_CAN_JOIN = "students from any branch, with no prior hackathon experience needed.";

const ICONS: Record<IconKind, string> = {
  calendar: "M7 2v3M17 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  pin: "M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  team: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1.5a4 4 0 0 0-3-3.9M16 4.2a3.5 3.5 0 0 1 0 6.6",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3",
};
const Icon = ({ k }: { k: IconKind }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={ICONS[k]} />
  </svg>
);

export default function EventDetail({ event: e }: { event: EventItem }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("About");
  const [open, setOpen] = useState<number | null>(0);

  const backToEvents = () => {
    if (sessionStorage.getItem(EVENT_LIST_SCROLL_KEY) !== null) {
      router.back();
      return;
    }

    router.push("/events");
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

  return (
    <>
      <TerrainBackground />
      <main className="page">
        <button className="btn line back-events" type="button" onClick={backToEvents}>
          ← Back to all events
        </button>
        <header className="head">
          <div className="titleblock">
            <h1>{e.name}</h1>
            <p className="tag">{e.tagline}</p>
          </div>
          <div className="headright">
            <div className="ghost"><b>{"//"}{e.number}</b><span>“{e.quote}”</span></div>
            {e.registerUrl ? <a className="btn gold" href={e.registerUrl} target="_blank" rel="noreferrer">Register now</a> : <span className="btn gold" aria-disabled="true">Registration TBA</span>}
          </div>
        </header>

        <section className="stats">
          {e.stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="ico"><Icon k={s.icon} /></span>
              <div><h3>{s.label}</h3><strong>{s.value}</strong>{s.sub && <p>{s.sub}</p>}</div>
            </div>
          ))}
        </section>

        <nav className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>

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

                <div className="highlights">
                  {(e.highlights ?? (e.slug === "hackathon" ? HIGHLIGHTS : [])).map((h) => (
                    <div key={h.label}><b>{h.value}</b><span>{h.label}</span></div>
                  ))}
                </div>

                <div className="perks">
                  <h3>What you get</h3>
                  <ul>
                    {(e.perks ?? (e.slug === "hackathon" ? PERKS : [])).map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <p className="who"><strong>Who can join:</strong> {e.whoCanJoin ?? (e.slug === "hackathon" ? WHO_CAN_JOIN : "Eligibility will be announced.")}</p>
                </div>
              </div>

              <div
                className={`stage${e.slug === "hack-the-hardware" ? " hack-the-hardware" : ""}`}
                style={{ ["--i" as string]: 1 }}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
              >
                <div className="imgwrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="heroimg" src={e.image || "/hackathon.webp"} alt={`${e.name} – Technex 2k26`} draggable={false} />
                </div>
                <div className="shade" />
                <div className="glow" />
                <div className="sweep" />
                <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
              </div>
            </div>
          )}

          {tab === "Rounds" && (
            <div className="rounds">
              <h2>Rounds &amp; timeline</h2>
              <ol>
                {e.rounds.map((r, i) => (
                  <li key={r.title} style={{ ["--i" as string]: i }}>
                    <span className="dot" />
                    <div className="card"><b>{String(i + 1).padStart(2, "0")}</b><strong>{r.title}</strong><p>{r.text}</p></div>
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
                  <div className="card" key={r.title} style={{ ["--i" as string]: i }}><strong>{r.title}</strong><p>{r.text}</p></div>
                ))}
              </div>
              {e.rulebookUrl ? <a className="btn line" href={e.rulebookUrl} target="_blank" rel="noreferrer">View full rule book</a> : <span className="btn line">Rule book coming soon</span>}
            </div>
          )}

          {tab === "Contact" && (
            <div className="contact">
              <h2>Get in touch</h2>
              <div className="ruleGrid">
                {e.contacts.length === 0 && <p>Event coordinator details will be announced.</p>}
                {e.contacts.map((c, i) => (
                  <a className="card call" key={c.name} href={`tel:${c.phone.replace(/\s/g, "")}`} style={{ ["--i" as string]: i }}>
                    <strong>{c.name}</strong><p>{c.phone}</p><span>Call now</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {tab === "FAQs" && (
            <div className="faqs">
              {e.faqs.map((f, i) => (
                <div className={`faq ${open === i ? "open" : ""}`} key={f.q} style={{ ["--i" as string]: i }}>
                  <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                    {f.q}<em>＋</em>
                  </button>
                  <div className="ans"><p>{f.a}</p></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}