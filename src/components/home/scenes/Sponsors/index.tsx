"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { sponsorsContent, type Sponsor } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSceneEnv } from "../../useSceneEnv";
import styles from "./sponsors.module.css";

function Logo({ s }: { s: Sponsor }) {
  return (
    <li className={styles.logo} data-dark={s.onDark || undefined}>
      <Image src={s.logo} alt={s.name} width={180} height={80} sizes="180px" />
    </li>
  );
}

/** Logo marquee: two rows in opposite directions, paused on hover/focus; title sponsor in the spotlight. */
export default function Sponsors() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, mobile } = useSceneEnv();
  const { title, rows } = sponsorsContent();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(ref);
      gsap
        .timeline({
          scrollTrigger: mobile
            ? { trigger: ref.current, start: "top 75%", end: "top 25%", scrub: 0.5 }
            : { trigger: ref.current, start: "top top", end: "+=45%", pin: true, scrub: 0.5 },
        })
        .from(q(`.${styles.spot}`), { scale: 0.6, opacity: 0, duration: 0.5 })
        .from(q(`.${styles.title}`), { y: 40, opacity: 0, duration: 0.4 }, 0)
        .from(q(`.${styles.track}`), { opacity: 0, x: (i: number) => (i ? 200 : -200), duration: 0.5 }, 0.2);
    },
    { scope: ref, dependencies: [reduced, mobile] },
  );

  return (
    <div ref={ref} className={styles.sponsors} data-reduced={reduced}>
      <header className={styles.head}>
        <p className={styles.kicker}>Partners in ink</p>
        <h2 className={styles.heading}>Sponsors</h2>
      </header>

      <div className={styles.spot}>
        <p className={styles.spotLabel}>Title sponsor</p>
        <div className={styles.spotLogo}>
          <Image src={title.logo} alt={title.name} width={360} height={140} sizes="(max-width: 767px) 70vw, 360px" />
        </div>
        <p className={styles.title}>{title.name}</p>
      </div>

      <div className={styles.marquees}>
        {rows.map((row, r) => (
          <div key={r} className={styles.marquee} data-dir={r ? "right" : "left"}>
            <ul className={styles.track} aria-label={r === 0 ? "Sponsors" : undefined} aria-hidden={r === 1 ? true : undefined}>
              {[...row, ...row, ...row].map((s, i) => (
                <Logo key={`${s.id}-${i}`} s={s} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Link href="/sponsors" className={styles.more}>
        All partners →
      </Link>
    </div>
  );
}
