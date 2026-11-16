"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { conclave } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { useSceneEnv } from "../../useSceneEnv";
import { useConclaveTimeline } from "./useConclaveTimeline";
import styles from "./conclave.module.css";

export default function Conclave() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, mobile } = useSceneEnv();
  const { speakers, isPastLineup } = conclave();
  const [open, setOpen] = useState<number | null>(null);
  useConclaveTimeline(ref, { reduced, mobile });

  /** Ink panel blooms from the pointer position. */
  const reveal = (e: React.SyntheticEvent<HTMLElement>, i: number) => {
    setOpen(i);
    const card = e.currentTarget;
    const panel = card.querySelector<HTMLElement>(`.${styles.panel}`);
    if (!panel || reduced) return;
    const r = card.getBoundingClientRect();
    const pt = e.nativeEvent instanceof MouseEvent ? e.nativeEvent : null;
    const x = pt ? ((pt.clientX - r.left) / r.width) * 100 : 50;
    const y = pt ? ((pt.clientY - r.top) / r.height) * 100 : 50;
    gsap.fromTo(panel, { clipPath: `circle(0% at ${x}% ${y}%)` }, { clipPath: `circle(150% at ${x}% ${y}%)`, duration: 0.6, ease: "power3.out" });
  };
  const hide = (e: React.SyntheticEvent<HTMLElement>) => {
    setOpen(null);
    const panel = e.currentTarget.querySelector<HTMLElement>(`.${styles.panel}`);
    if (panel && !reduced) gsap.to(panel, { clipPath: "circle(0% at 50% 100%)", duration: 0.4, ease: "power2.in" });
  };

  return (
    <div ref={ref} className={styles.conclave} data-reduced={reduced}>
      <div className={styles.side}>
        <h2 className={styles.vertical}>Tech Conclave</h2>
      </div>

      <div className={styles.main}>
        <header className={styles.head}>
          <p className={styles.kicker}>{isPastLineup ? "Voices from past editions" : "Speakers"}</p>
          <p className={styles.note}>
            {isPastLineup
              ? "Guests who have taken the TECHNEX stage. This year's conclave line-up will be announced here."
              : null}
          </p>
        </header>

        <ul className={styles.grid}>
          {speakers.map((s, i) => (
            <li
              key={s.name}
              className={styles.card}
              tabIndex={0}
              aria-describedby={`speaker-${i}`}
              data-open={open === i}
              data-cursor="READ"
              onPointerEnter={(e) => e.pointerType === "mouse" && reveal(e, i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && hide(e)}
              onFocus={(e) => reveal(e, i)}
              onBlur={hide}
              onClick={(e) => (open === i ? hide(e) : reveal(e, i))}
            >
              <div className={styles.photo}>
                <Image src={s.image} alt={s.name} fill sizes="(max-width: 767px) 50vw, 22vw" className={styles.img} />
              </div>
              <p className={styles.name}>{s.name}</p>
              <p className={styles.title}>{s.title}</p>
              <div id={`speaker-${i}`} className={styles.panel}>
                <p className={styles.role}>{s.role}</p>
                <p className={styles.quote}>&ldquo;{s.bio ?? s.quote}&rdquo;</p>
                <p className={styles.panelTitle}>{s.title}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/about" className={styles.more}>
          More about TECHNEX →
        </Link>
      </div>
    </div>
  );
}
