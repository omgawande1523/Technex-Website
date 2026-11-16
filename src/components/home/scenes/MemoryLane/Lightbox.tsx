"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { galleryThumb, type MediaItem } from "@/lib/content";
import { useLenis } from "@/components/providers/SmoothScroll";
import styles from "./memory-lane.module.css";

/** Full-screen photo viewer: ←/→ to browse, Esc to close, focus returns to the opener. */
export default function Lightbox({
  items,
  index,
  onIndex,
}: {
  items: MediaItem[];
  index: number | null;
  onIndex: (i: number | null) => void;
}) {
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const isOpen = index !== null && items.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    lenis?.stop();
    const n = items.length;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      if (e.key === "ArrowRight") onIndex(((index ?? 0) + 1) % n);
      if (e.key === "ArrowLeft") onIndex(((index ?? 0) - 1 + n) % n);
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      lenis?.start();
    };
  }, [isOpen, index, items.length, onIndex, lenis]);

  useEffect(() => {
    if (!isOpen) openerRef.current?.focus?.();
  }, [isOpen]);

  const item = isOpen ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
          onClick={(e) => e.target === e.currentTarget && onIndex(null)}
        >
          <AnimatePresence mode="wait">
            <motion.figure
              key={item.src}
              className={styles.lbFigure}
              initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: -1.5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary photo */}
              <img src={galleryThumb(item.src, 1600)} alt={item.title} />
              <figcaption>
                {item.title} · {index! + 1} / {items.length}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <button type="button" className={styles.lbPrev} onClick={() => onIndex((index! - 1 + items.length) % items.length)} aria-label="Previous photo">
            ←
          </button>
          <button type="button" className={styles.lbNext} onClick={() => onIndex((index! + 1) % items.length)} aria-label="Next photo">
            →
          </button>
          <button ref={closeRef} type="button" className={styles.lbClose} onClick={() => onIndex(null)} aria-label="Close">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
