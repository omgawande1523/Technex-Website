"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
/** Slim, serialisable event row prepared on the server (keeps event data out of the client bundle). */
export type FinderEvent = {
  slug: string;
  number: string;
  name: string;
  category: string;
  searchText: string;
  image: string | null;
  panel: string;
  href: string;
  meta: string;
  days: number[];
  team: "Solo" | "Team" | "Unknown";
};
import styles from "./event-finder.module.css";

type Props = {
  events: FinderEvent[];
  categories: string[];
  days: { day: number; label: string }[];
};

type Team = FinderEvent["team"];
const TEAM_LABEL: Record<Team, string> = { Solo: "Solo", Team: "Team", Unknown: "Team size TBA" };

/**
 * Search + filter chips for /events (category, festival day, team size).
 * Everything is derived from content.ts; events whose day or team size is not
 * in the data are only excluded when that filter is active.
 */
export default function EventFinder({ events, categories, days }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const deferredQuery = useDeferredValue(query);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const teams = useMemo(
    () => (["Solo", "Team", "Unknown"] as Team[]).filter((t) => events.some((e) => e.team === t)),
    [events],
  );

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return events.filter((e) => {
      if (category && e.category !== category) return false;
      if (day !== null && !e.days.includes(day)) return false;
      if (team && e.team !== team) return false;
      return !q || e.searchText.includes(q);
    });
  }, [events, deferredQuery, category, day, team]);

  const undatedCount = events.filter((e) => e.days.length === 0).length;
  const anyFilter = !!(query || category || day !== null || team);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reset = () => {
    setQuery("");
    setCategory(null);
    setDay(null);
    setTeam(null);
  };

  return (
    <>
      {!inView && (
        <a href="#find-events" className={styles.jump} data-no-ink>
          Find an event ↓
        </a>
      )}
      <section id="find-events" ref={sectionRef} className={styles.finder} aria-labelledby="find-title">
        <div className={styles.inner}>
          <h2 id="find-title" className={styles.title}>
            Find an event
          </h2>

          <div className={styles.controls}>
            <label className={styles.search}>
              <span className="sr-only">Search events</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, category or domain"
                className={styles.input}
              />
            </label>

            <ChipGroup label="Category">
              {categories.map((c) => (
                <Chip key={c} pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
                  {c}
                </Chip>
              ))}
            </ChipGroup>

            {days.length > 0 && (
              <ChipGroup label="Day">
                {days.map((d) => (
                  <Chip key={d.day} pressed={day === d.day} onClick={() => setDay(day === d.day ? null : d.day)}>
                    {d.label}
                  </Chip>
                ))}
              </ChipGroup>
            )}

            <ChipGroup label="Team size">
              {teams.map((t) => (
                <Chip key={t} pressed={team === t} onClick={() => setTeam(team === t ? null : t)}>
                  {TEAM_LABEL[t]}
                </Chip>
              ))}
            </ChipGroup>
          </div>

          <p className={styles.count} aria-live="polite">
            {results.length} of {events.length} events
            {day !== null && undatedCount > 0 && ` · ${undatedCount} events have no confirmed day yet`}
            {anyFilter && (
              <button type="button" className={styles.reset} onClick={reset}>
                Clear filters
              </button>
            )}
          </p>

          <ul className={styles.grid}>
            {results.map((e) => (
              <li key={e.slug}>
                <Link href={e.href} className={styles.card}>
                  <div className={styles.thumb}>
                    <Image src={e.image ?? e.panel} alt="" fill sizes="(max-width: 767px) 100vw, 320px" unoptimized={!e.image} />
                  </div>
                  <div className={styles.body}>
                    <span className={styles.cat}>
                      {e.number} · {e.category}
                    </span>
                    <h3 className={styles.name}>{e.name}</h3>
                    <p className={styles.meta}>{e.meta}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {results.length === 0 && <p className={styles.meta}>No events match. Try clearing a filter.</p>}
        </div>
      </section>
    </>
  );
}

function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}
