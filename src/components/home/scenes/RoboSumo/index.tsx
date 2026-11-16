"use client";

import { useRef } from "react";
import Link from "next/link";
import { getFlagship, numericParts, TBA } from "@/lib/content";
import { useSceneEnv } from "../../useSceneEnv";
import { useRoboSumoTimeline } from "./useRoboSumoTimeline";
import styles from "./robo-sumo.module.css";

const SLUG = "robo-sumo";

/** One stat cell; numbers count up from 0 to the value in the data. */
function Stat({ label, value }: { label: string; value: string | null }) {
  const parts = value ? numericParts(value) : null;
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>
        {parts ? (
          <>
            {parts.prefix}
            <span data-count={parts.value} data-format={value ?? ""}>
              {parts.format(parts.value)}
            </span>
            {parts.suffix}
          </>
        ) : (
          (value ?? TBA)
        )}
      </dd>
    </div>
  );
}

export default function RoboSumo() {
  const flagship = getFlagship(SLUG);
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, mobile } = useSceneEnv();
  useRoboSumoTimeline(ref, { reduced, mobile });
  if (!flagship) return null;
  const { event } = flagship;
  const arena = event.extras.arena;
  const words = event.name.toUpperCase().split(/\s+/);

  return (
    <div ref={ref} className={styles.arena} data-reduced={reduced}>
      <div className={styles.shake}>
        <svg className={styles.ring} viewBox="0 0 400 400" aria-hidden="true">
          <circle cx="200" cy="200" r="182" className={styles.ringOuter} data-ring />
          <circle cx="200" cy="200" r="150" className={styles.ringBoundary} data-ring />
          <path d="M150 200 H180 M220 200 H250" className={styles.ringLines} data-ring />
          <g className={styles.botLeft}>
            <rect x="96" y="176" width="58" height="48" rx="6" />
            <rect x="104" y="168" width="14" height="8" />
            <rect x="104" y="224" width="14" height="8" />
            <path d="M154 184 L166 192 L166 208 L154 216 Z" />
          </g>
          <g className={styles.botRight}>
            <rect x="246" y="176" width="58" height="48" rx="6" />
            <rect x="282" y="168" width="14" height="8" />
            <rect x="282" y="224" width="14" height="8" />
            <path d="M246 184 L234 192 L234 208 L246 216 Z" />
          </g>
          <g className={styles.sparks}>
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <line key={i} x1={200 + Math.cos(a) * 10} y1={200 + Math.sin(a) * 10} x2={200 + Math.cos(a) * 34} y2={200 + Math.sin(a) * 34} />;
            })}
          </g>
        </svg>

        <div className={styles.copy}>
          <p className={styles.kicker}>
            Flagship #{event.number} · {event.category}
          </p>
          <h2 className={styles.title} aria-label={`${event.name}: enter arena`}>
            {words.map((w) => (
              <span key={w} className={styles.slam}>
                {w}
              </span>
            ))}
            <span className={styles.enter}>Enter arena</span>
          </h2>
          {event.tagline && <p className={styles.tagline}>{event.tagline}</p>}

          <dl className={styles.stats}>
            <Stat label="Dates" value={event.date} />
            <Stat label="Prize pool" value={event.prize} />
            <Stat label="Arena size" value={arena?.size ?? null} />
            <Stat label={arena && arena.weightClasses.length > 1 ? "Weight classes" : "Weight class"} value={arena?.weightClasses.join(" · ") || null} />
          </dl>

          <div className={styles.ctas}>
            <Link href={event.registerHref} className={styles.cta} data-magnetic>
              Register team
            </Link>
            {event.rulebookUrl && (
              <a href={event.rulebookUrl} className={styles.ghost} target="_blank" rel="noopener noreferrer">
                Rulebook
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
