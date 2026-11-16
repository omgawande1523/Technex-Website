"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { EventSummary } from "@/lib/content";
import styles from "./map.module.css";
import shared from "./routes.module.css";

type Props = {
  placed: EventSummary[];
  unplaced: EventSummary[];
  venue: { name: string; address: string; mapUrl: string; coordinates: string };
};

/**
 * Illustrated campus map with one pin per event that has `extras.mapPin`.
 * Events without a confirmed location sit in the "Location TBA" tray; both
 * open the same event card.
 */
export default function CampusMap({ placed, unplaced, venue }: Props) {
  const [open, setOpen] = useState<EventSummary | null>(null);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={styles.layout}>
      <figure className={styles.mapWrap}>
        <Image
          src="/assets/decor/fantasy_campus_map.webp"
          alt={`Illustrated map of the ${venue.name} campus`}
          width={1024}
          height={576}
          priority
          className={styles.mapImage}
        />
        <div className={styles.pins}>
          {placed.map((ev) => (
            <button
              key={ev.slug}
              type="button"
              className={styles.pin}
              style={{ left: `${ev.extras.mapPin!.x}%`, top: `${ev.extras.mapPin!.y}%` }}
              onClick={() => setOpen(ev)}
              aria-label={`${ev.name} — ${ev.extras.mapPin!.place}`}
            >
              <span className={styles.pinDot} aria-hidden="true" />
              <span className={styles.pinLabel}>{ev.name}</span>
            </button>
          ))}
        </div>
        <figcaption className={styles.caption}>
          Illustrative map, not to scale.{" "}
          <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer">
            Open {venue.name} in Google Maps ({venue.coordinates}) ↗
          </a>
        </figcaption>
      </figure>

      <aside className={styles.tray} aria-labelledby="tba">
        <h2 id="tba" className={shared.sectionTitle}>
          Location TBA ({unplaced.length})
        </h2>
        <p className={shared.meta}>Venues inside the campus are being finalised. Pick an event for its details.</p>
        <ul className={styles.trayList}>
          {unplaced.map((ev) => (
            <li key={ev.slug}>
              <button type="button" className={styles.trayItem} onClick={() => setOpen(ev)}>
                <span className={styles.trayNum}>{ev.number}</span>
                <span>{ev.name}</span>
                <span className={styles.trayCat}>{ev.category}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className={shared.meta} style={{ marginTop: 16 }}>
          {venue.name} · {venue.address}
        </p>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.cardBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.article
              role="dialog"
              aria-modal="true"
              aria-labelledby="map-card-title"
              className={`${shared.card} ${styles.eventCard}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={shared.tag}>{open.category}</span>
              <h3 id="map-card-title" className={shared.cardTitle}>
                {open.name}
              </h3>
              {open.tagline && <p className={shared.meta}>{open.tagline}</p>}
              <dl className={styles.facts}>
                <dt>Date</dt>
                <dd>{open.date ?? "TBA"}</dd>
                <dt>Venue</dt>
                <dd>{open.extras.mapPin?.place ?? open.venue ?? "TBA"}</dd>
                <dt>Team</dt>
                <dd>{open.teamSize ?? "TBA"}</dd>
                <dt>Prize</dt>
                <dd>{open.prize ?? "TBA"}</dd>
              </dl>
              <div className={shared.cardActions}>
                <Link href={open.href} className={shared.button}>
                  Event details
                </Link>
                <button ref={closeRef} type="button" className={shared.ghost} onClick={() => setOpen(null)}>
                  Close
                </button>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
