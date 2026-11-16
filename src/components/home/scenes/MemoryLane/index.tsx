"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { galleryThumb, loadGalleryMedia, type MediaItem } from "@/lib/content";
import { useSceneEnv } from "../../useSceneEnv";
import Lightbox from "./Lightbox";
import { useMemoryLaneTimeline } from "./useMemoryLaneTimeline";
import styles from "./memory-lane.module.css";

/** Stable pseudo-random scatter per index, so server and client agree. */
const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export default function MemoryLane() {
  const ref = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const { reduced, mobile } = useSceneEnv();

  useEffect(() => {
    const ctrl = new AbortController();
    loadGalleryMedia(ctrl.signal)
      .then(setMedia)
      .catch((e) => {
        if (e?.name !== "AbortError") setError(true);
      });
    return () => ctrl.abort();
  }, []);

  const photos = media ?? [];
  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), photos.slice(half)];
  useMemoryLaneTimeline(ref, { reduced, mobile, ready: photos.length > 0 });

  return (
    <div ref={ref} className={styles.lane} data-reduced={reduced}>
      <header className={styles.head}>
        <p className={styles.kicker}>Past editions</p>
        <h2 className={styles.title}>Memory lane</h2>
        <Link href="/gallery" className={styles.all}>
          Full gallery →
        </Link>
      </header>

      {error && <p className={styles.status}>The gallery could not be loaded right now.</p>}
      {!media && !error && <p className={styles.status}>Developing photos…</p>}

      <div className={styles.rows}>
        {rows.map((row, r) => (
          <ul key={r} className={styles.row} data-row={r}>
            {row.map((m, i) => {
              const index = r * half + i;
              const depth = 0.75 + jitter(index, 3) * 0.5;
              return (
                <li
                  key={m.src}
                  className={styles.polaroid}
                  data-depth={depth.toFixed(2)}
                  style={{
                    rotate: `${(jitter(index, 1) - 0.5) * 10}deg`,
                    translate: `0 ${(jitter(index, 2) - 0.5) * (mobile ? 20 : 70)}px`,
                    zIndex: Math.round(depth * 10),
                  }}
                >
                  <button type="button" onClick={() => setOpen(index)} data-cursor="VIEW" aria-label={`Open ${m.title}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary photos resized via URL */}
                    <img src={galleryThumb(m.src, 520)} alt="" loading="lazy" decoding="async" width={260} height={300} />
                    <span>{m.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>

      <Lightbox items={photos} index={open} onIndex={setOpen} />
    </div>
  );
}
