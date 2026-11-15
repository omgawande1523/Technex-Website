"use client";

import { useEffect, useState } from "react";
import { festival } from "@/lib/content";
import styles from "./hero.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

function parts(now: number) {
  const start = Date.parse(festival.startsAt);
  const end = Date.parse(festival.endsAt);
  if (now >= end) return { state: "over" as const };
  if (now >= start) return { state: "live" as const };
  let s = Math.floor((start - now) / 1000);
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  return { state: "soon" as const, d, h, m, s: s - m * 60 };
}

/** Live countdown to festival.startsAt. Renders dashes on the server. */
export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const p = now === null ? null : parts(now);
  if (p && p.state !== "soon") {
    return <p className={styles.countLive}>{p.state === "live" ? "Live now" : "That's a wrap"}</p>;
  }
  const cells: [string, string][] = [
    ["days", p ? pad(p.d) : "--"],
    ["hrs", p ? pad(p.h) : "--"],
    ["min", p ? pad(p.m) : "--"],
    ["sec", p ? pad(p.s) : "--"],
  ];
  return (
    <div className={styles.count} role="timer" aria-label="Time until the festival starts">
      {cells.map(([label, value]) => (
        <div key={label} className={styles.countCell}>
          <span className={styles.countValue}>{value}</span>
          <span className={styles.countLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}
