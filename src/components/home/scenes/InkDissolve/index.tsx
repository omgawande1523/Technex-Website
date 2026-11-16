"use client";

import { useRef } from "react";
import { useSceneEnv } from "../../useSceneEnv";
import { useInkDissolveTimeline } from "./useInkDissolveTimeline";
import styles from "./ink-dissolve.module.css";

/**
 * Transition between the arena and the conclave: the previous scene's title
 * breaks into ink pixels that drift, then re-form as the next scene's title.
 * Canvas 2D so it also runs on phones (fewer pixels there).
 */
export default function InkDissolve({ from, to }: { from: string; to: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, mobile, hydrated } = useSceneEnv();
  useInkDissolveTimeline(ref, canvasRef, { from, to, reduced, mobile, ready: hydrated });

  return (
    <div ref={ref} className={styles.dissolve} data-reduced={reduced}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <p className={styles.fallback}>{to}</p>
    </div>
  );
}
