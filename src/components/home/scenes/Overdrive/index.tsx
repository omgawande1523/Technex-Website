"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getFlagship } from "@/lib/content";
import { useSceneEnv } from "../../useSceneEnv";
import { FrameSequence, type SequenceManifest } from "./frameSequence";
import { useOverdriveTimeline } from "./useOverdriveTimeline";
import styles from "./overdrive.module.css";

const SLUG = "overdrive";
const BASE = `/sequences/${SLUG}`;

export default function Overdrive() {
  const flagship = getFlagship(SLUG);
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sequence, setSequence] = useState<FrameSequence | null>(null);
  const [manifest, setManifest] = useState<SequenceManifest | null>(null);
  const [loaded, setLoaded] = useState(0);
  const { reduced, mobile } = useSceneEnv();

  // Manifest -> sequence (half the frames on mobile).
  useEffect(() => {
    let seq: FrameSequence | null = null;
    const ctrl = new AbortController();
    fetch(`${BASE}/manifest.json`, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<SequenceManifest>) : Promise.reject(new Error(`manifest ${r.status}`))))
      .then((m) => {
        setManifest(m);
        seq = new FrameSequence(`${BASE}/${mobile ? "mobile" : "desktop"}`, mobile ? m.mobileFrames : m.frames, m.pattern);
        setSequence(seq);
        // Reduced motion needs one still frame only.
        if (reduced) return seq.load(undefined, [Math.floor(seq.length / 2)]);
        return seq.load((n) => setLoaded(n));
      })
      .catch((err) => {
        if (err?.name !== "AbortError") console.warn("[Overdrive] no frame sequence", err);
      });
    return () => {
      ctrl.abort();
      seq?.cancel();
    };
  }, [mobile, reduced]);

  useOverdriveTimeline(ref, canvasRef, { reduced, mobile, sequence });

  if (!flagship) return null;
  const { event, specs, ticker } = flagship;
  const total = sequence ? (mobile ? manifest?.mobileFrames : manifest?.frames) ?? 0 : 0;

  return (
    <div ref={ref} className={styles.cinema} data-reduced={reduced}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.titleBlock}>
        <p className={styles.kicker}>
          Flagship #{event.number} · {event.category}
        </p>
        <h2 className={styles.title}>{event.name}</h2>
        {event.quote && <p className={styles.quote}>{event.quote}</p>}
      </div>

      <aside className={styles.sheet} aria-label={`${event.name} spec sheet`}>
        <p className={styles.sheetHead}>Spec sheet // {event.slug}</p>
        <dl>
          {specs.map((s) => (
            <div key={s.label} className={styles.row}>
              <dt>{s.label}</dt>
              <dd data-type={s.value}>{s.value}</dd>
              {s.sub && <dd className={styles.sub} data-type={s.sub}>{s.sub}</dd>}
            </div>
          ))}
        </dl>
        <Link href={event.registerHref.startsWith("/") ? event.registerHref : event.href} className={styles.cta} data-magnetic>
          {event.registerHref.startsWith("/register/") ? "Register team" : "View event"}
        </Link>
      </aside>

      <p className={styles.chip} aria-hidden="true">
        <span className={styles.chipDot} /> Scroll to move
      </p>
      {manifest?.placeholder && <p className={styles.placeholder}>Placeholder footage</p>}
      {!reduced && total > 0 && loaded < total && (
        <p className={styles.loading} aria-hidden="true">
          {Math.round((loaded / total) * 100)}%
        </p>
      )}

      <div className={styles.marquee} aria-label={ticker.join(", ")}>
        <div className={styles.marqueeTrack} aria-hidden="true">
          {[0, 1].map((k) => (
            <span key={k} className={styles.marqueeGroup}>
              {ticker.map((t) => (
                <span key={t}>
                  {t}
                  <i>•</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
