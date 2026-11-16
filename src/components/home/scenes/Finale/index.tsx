"use client";

import { useRef } from "react";
import Link from "next/link";
import { coordinatesLabel, festival, festivalDates, navRoutes, registerHref } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScroll";
import { useSceneEnv } from "../../useSceneEnv";
import { FINALE_LINES, FINALE_VIEWBOX } from "./finalePaths";
import styles from "./finale.module.css";

export default function Finale() {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const { reduced, mobile } = useSceneEnv();
  const dates = festivalDates();

  useGSAP(
    () => {
      const q = gsap.utils.selector(ref);
      if (reduced) {
        gsap.set(q("[data-glyph]"), { fillOpacity: 1 });
        return;
      }
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: mobile
            ? { trigger: ref.current, start: "top 70%", end: "center 55%", scrub: 0.6 }
            : { trigger: ref.current, start: "top top", end: "+=80%", pin: true, scrub: 0.6 },
        })
        .fromTo(q("[data-glyph]"), { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.08, duration: 0.5 })
        .to(q("[data-glyph]"), { fillOpacity: 1, stagger: 0.04, duration: 0.3 }, ">-0.3")
        .from(q(`.${styles.cols} > *, .${styles.drip}`), { opacity: 0, y: 30, stagger: 0.06, duration: 0.3 }, "<");
    },
    { scope: ref, dependencies: [reduced, mobile] },
  );

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: reduced ? 0 : 2.2 });
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <footer ref={ref} className={styles.finale}>
      <svg
        className={styles.words}
        viewBox={`0 0 ${FINALE_VIEWBOX.width} ${FINALE_VIEWBOX.height}`}
        role="img"
        aria-label={FINALE_LINES.map((l) => l.text).join(" ")}
      >
        {FINALE_LINES.map((line, li) => (
          <g key={li} transform={`translate(${(FINALE_VIEWBOX.width - line.width) / 2} 0)`}>
            {line.glyphs.map((g, gi) => (
              <path key={gi} d={g.d} data-glyph className={styles.glyph} />
            ))}
          </g>
        ))}
      </svg>

      <div className={styles.cols}>
        <div>
          <p className={styles.label}>When</p>
          <p className={styles.big}>{dates.label}</p>
          <Link href={registerHref} className={styles.cta} data-magnetic>
            Register
          </Link>
        </div>
        <div>
          <p className={styles.label}>Where</p>
          <p>
            {festival.host}
            <br />
            {festival.address}
          </p>
          <a href={festival.mapUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Open map · {coordinatesLabel(3)}
          </a>
        </div>
        <div>
          <p className={styles.label}>Contact</p>
          <p>
            <a href={`mailto:${festival.email}`} className={styles.link}>
              {festival.email}
            </a>
            <br />
            <a href={festival.phoneHref} className={styles.link}>
              {festival.phone}
            </a>
          </p>
          <ul className={styles.socials}>
            {festival.socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer">
          <p className={styles.label}>Explore</p>
          <ul className={styles.links}>
            {navRoutes()
              .filter((r) => r.href !== "/")
              .map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>{r.label}</Link>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      <button type="button" className={styles.drip} onClick={toTop} aria-label="Back to top" data-cursor="TOP">
        <svg viewBox="0 0 80 140" aria-hidden="true">
          <path className={styles.dripShape} d="M8 0 H72 V22 C72 34 60 34 56 46 C52 60 50 80 46 98 C44 108 36 108 34 98 C30 80 28 60 24 46 C20 34 8 34 8 22 Z" />
          <circle className={styles.dripDrop} cx="40" cy="124" r="7" />
        </svg>
        <span>Back to top</span>
      </button>

      <p className={styles.legal}>
        © {new Date(festival.endsAt).getFullYear()} {festival.name} · {festival.host}
      </p>
    </footer>
  );
}
