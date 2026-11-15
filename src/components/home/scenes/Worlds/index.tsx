"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { worlds } from "@/lib/content";
import { Flip, gsap } from "@/lib/gsap";
import { useSceneEnv } from "../../useSceneEnv";
import WorldArt from "./WorldArt";
import { useWorldsTimeline } from "./useWorldsTimeline";
import styles from "./worlds.module.css";

export default function Worlds() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { reduced, mobile } = useSceneEnv();
  useWorldsTimeline(ref, { reduced, mobile });
  const items = worlds();

  const redraw = (card: HTMLElement) => {
    if (reduced) return;
    gsap.fromTo(
      card.querySelectorAll("[data-draw]"),
      { drawSVG: "0%" },
      { drawSVG: "100%", duration: 1.1, stagger: 0.12, ease: "power2.inOut", overwrite: true },
    );
  };

  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced || mobile || e.pointerType !== "mouse") return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, { rotationY: x * 16, rotationX: -y * 14, duration: 0.5, ease: "power3.out", transformPerspective: 900 });
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { rotationY: 0, rotationX: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
  };

  /** Flip the card open to full screen, then route. */
  const open = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const card = e.currentTarget;
    gsap.set(card, { rotationX: 0, rotationY: 0 });
    const state = Flip.getState(card);
    card.classList.add(styles.expanded);
    Flip.from(state, {
      duration: 0.75,
      ease: "power3.inOut",
      absolute: true,
      zIndex: 90,
      onComplete: () => router.push(href),
    });
  };

  return (
    <div ref={ref} className={styles.worlds}>
      <header className={styles.head}>
        <p className={styles.kicker}>Choose your world</p>
        <h2 className={styles.title}>Worlds</h2>
      </header>
      <ul className={styles.grid}>
        {items.map((w, i) => (
          <li key={w.id} className={styles.cell}>
            <Link
              href={w.href}
              className={styles.card}
              data-no-ink
              data-cursor="OPEN"
              onPointerEnter={(e) => redraw(e.currentTarget)}
              onFocus={(e) => redraw(e.currentTarget)}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              onClick={(e) => open(e, w.href)}
            >
              <span className={styles.index}>{String(i + 1).padStart(2, "0")}</span>
              <WorldArt id={w.id} className={styles.art} />
              <span className={styles.cardTitle}>{w.title}</span>
              <span className={styles.count}>
                {w.count} <small>{w.id === "passes" ? "ways in" : w.id}</small>
              </span>
              <span className={styles.labels}>{w.labels.slice(0, 4).join(" · ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
