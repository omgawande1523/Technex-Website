"use client";

import { useRef } from "react";
import { festival, worlds } from "@/lib/content";
import { useSceneEnv } from "../../useSceneEnv";
import { usePortalTimeline } from "./usePortalTimeline";
import styles from "./portal.module.css";

/** Cracked, glowing ink frame that slides in, then swallows the camera into the Worlds scene. */
const FRAME_PATH =
  "M14,22 L60,9 L118,16 L171,6 L233,14 L288,8 L330,19 L342,70 L336,128 L346,190 L338,246 L326,292 L270,300 L214,293 L160,304 L104,295 L52,302 L12,290 L18,236 L8,180 L16,124 L6,72 Z";
const CRACKS = [
  "M60,9 L66,34 L58,52 L70,68",
  "M288,8 L280,30 L292,44",
  "M342,70 L318,82 L326,98",
  "M8,180 L34,186 L28,204 L44,214",
  "M214,293 L220,268 L208,252",
  "M326,292 L304,276 L310,258 L296,248",
];

export default function Portal() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, mobile } = useSceneEnv();
  usePortalTimeline(ref, { reduced, mobile });
  const count = worlds().length;

  return (
    <div ref={ref} className={styles.portal} data-reduced={reduced}>
      <p className={styles.bgWord} aria-hidden="true">
        {festival.theme}
      </p>
      <div className={styles.frame}>
        <div className={styles.window}>
          <div className={styles.windowHalftone} aria-hidden="true" />
          <p className={styles.windowKicker}>{String(count).padStart(2, "0")} worlds</p>
          <h2 className={styles.windowTitle}>Step through the ink</h2>
        </div>
        <svg className={styles.edge} viewBox="0 0 350 310" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <filter id="portal-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="portal-rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" />
              <feDisplacementMap in="SourceGraphic" scale="4" />
            </filter>
          </defs>
          <g filter="url(#portal-glow)">
            <path d={FRAME_PATH} className={styles.edgeStroke} filter="url(#portal-rough)" vectorEffect="non-scaling-stroke" />
            {CRACKS.map((d) => (
              <path key={d} d={d} className={styles.crack} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
