"use client";

import { useEffect, useRef, useState } from "react";
import { startGallery } from "@/lib/gallery/engine";
import styles from "./gallery.module.css";

export default function GalleryScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const counter = counterRef.current;
    const total = totalRef.current;
    const card = cardRef.current;
    if (!canvas || !counter || !total || !card) return;

    const { dispose } = startGallery(canvas, { counter, total, card }, {
      onFatal: (message) => setFatal(message),
    });
    return () => dispose();
  }, []);

  return (
    <main className={styles.scene}>
      <canvas className={styles.webgl} ref={canvasRef} />
      <div className={styles.vignette} />

      <div className={styles.brand}>
        <div className={styles.brandPrimary}>TECHNEX CREATIVE LABS</div>
        <div className={styles.brandSecondary}>ROLL_MEDIA_GALLERY</div>
        <div className={styles.brandVolume}>VOL. 01 · CORRIDOR</div>
      </div>

      <div className={styles.counter}>
        <span className={styles.counterNumber} ref={counterRef}>
          01
        </span>{" "}
        / <span ref={totalRef}>00</span>
      </div>

      <div className={`${styles.card} card`} ref={cardRef}>
        <div className={`${styles.cardTitle} t`}>—</div>
        <div className={`${styles.cardMeta} m`}>—</div>
        <div className={styles.cardEsc}></div>
      </div>

      {fatal ? (
        <div className={styles.fatal} role="alert">
          <div className={styles.fatalTitle}>ENGINE ERROR</div>
          <div className={styles.fatalMessage}>{fatal}</div>
          <div className={styles.fatalHelp}>
            FIX: ENABLE “USE GRAPHICS/WEBGL ACCELERATION” IN YOUR BROWSER
            SETTINGS, RELOAD WITH CTRL+SHIFT+R
          </div>
        </div>
      ) : null}
    </main>
  );
}
