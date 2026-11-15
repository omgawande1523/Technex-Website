"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { coordinatesLabel, festival, festivalDates, registerHref } from "@/lib/content";
import { useHud } from "@/lib/hud";
import { useSceneEnv } from "../../useSceneEnv";
import Countdown from "./Countdown";
import { useHeroTimeline } from "./useHeroTimeline";
import styles from "./hero.module.css";

const InkHologramCanvas = dynamic(() => import("@/components/three/InkHologramCanvas"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, mobile, hydrated } = useSceneEnv();
  const { gateOpen } = useHud();
  const dates = festivalDates();
  useHeroTimeline(ref, { reduced, mobile, start: hydrated && gateOpen });

  return (
    <div ref={ref} className={styles.hero} data-reduced={reduced}>
      <div className={styles.paper} aria-hidden="true" />
      <div className={styles.canvas}>
        {hydrated && <InkHologramCanvas mobile={mobile} reduced={reduced} offsetX={mobile ? 0 : 1.2} />}
      </div>

      <div className={styles.inner}>
        <h1 className={styles.wordmark} aria-label={`${festival.name} ${festival.edition} — ${festival.theme}`}>
          {festival.name}
        </h1>

        <div className={styles.copy}>
          <p className={styles.tagline}>{festival.tagline}</p>
          <aside className={styles.side}>
            <p className={styles.vertical}>
              {festival.shortName} <span aria-hidden="true">/</span> {festival.theme}
            </p>
            <p className={styles.coords}>
              <span className={styles.coordsLabel}>{festival.hostShort}</span>
              <a href={festival.mapUrl} target="_blank" rel="noopener noreferrer" data-cursor="MAP">
                {coordinatesLabel()}
              </a>
            </p>
          </aside>
        </div>

        <div className={styles.bottom}>
          <div className={styles.when}>
            <p className={styles.dates}>{dates.label}</p>
            <p className={styles.venue}>
              {festival.host}, {festival.city}
            </p>
          </div>
          <Countdown />
          <Link href={registerHref} className={styles.cta} data-magnetic data-cursor="GO">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
