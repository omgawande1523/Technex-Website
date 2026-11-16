"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { allEvents, allWorkshops, festivalDates } from "@/lib/content";
import ContourBackground from "../../ContourBackground";
import { useSceneEnv } from "../../useSceneEnv";
import { useWorkshopsCanvas, type CanvasItem } from "./useWorkshopsCanvas";
import styles from "./workshops-canvas.module.css";

/**
 * Day-wise canvas. The repo has no pronite/artist data, so (as briefed) this
 * is a Workshops canvas: workshops plus competitions, filterable by festival
 * day where the data states one. Workshops have no day yet (TODO in data),
 * so they appear under "All".
 */
function useItems(): CanvasItem[] {
  return useMemo(
    () => [
      ...allWorkshops().map((w) => ({
        id: `w-${w.slug}`,
        name: w.title.replace(/\s+Workshop$/i, ""),
        kind: "Workshop" as const,
        category: w.category,
        image: w.cover,
        href: w.href,
        days: w.day ? [w.day] : [],
      })),
      ...allEvents().map((e) => ({
        id: `e-${e.slug}`,
        name: e.name,
        kind: "Competition" as const,
        category: e.category,
        image: e.image ?? e.panel,
        href: e.href,
        days: e.extras.days,
      })),
    ],
    [],
  );
}

export default function WorkshopsCanvas() {
  const items = useItems();
  const { reduced, mobile } = useSceneEnv();
  const { dayCount } = festivalDates();
  const tabs = useMemo(() => {
    const days = Array.from({ length: dayCount }, (_, i) => i + 1).filter((d) => items.some((it) => it.days.includes(d)));
    return [{ id: 0, label: "All" }, ...days.map((d) => ({ id: d, label: `Day ${d}` }))];
  }, [items, dayCount]);
  const [tab, setTab] = useState(0);
  const visible = tab === 0 ? items : items.filter((it) => it.days.includes(tab));

  const rootRef = useRef<HTMLDivElement>(null);
  const { viewportRef, worldRef, panRef, previewRef, onEnterItem, onLeaveItem, tiles } = useWorkshopsCanvas(rootRef, visible, {
    reduced,
    mobile,
  });

  return (
    <div ref={rootRef} className={styles.scene}>
      <ContourBackground className={styles.contours} still={reduced} panRef={panRef} />

      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Drag to explore</p>
          <h2 className={styles.title}>Workshops &amp; arenas</h2>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Festival day">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={styles.tab}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {mobile ? (
        <ul className={styles.strip}>
          {visible.map((it) => (
            <li key={it.id}>
              <Link href={it.href} className={styles.stripItem}>
                {/* eslint-disable-next-line @next/next/no-img-element -- small decorative thumbnails in a native scroller */}
                <img src={it.image} alt="" loading="lazy" />
                <span className={styles.stripKind}>{it.kind}</span>
                <span className={styles.stripName}>{it.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div
          ref={viewportRef}
          className={styles.viewport}
          tabIndex={0}
          aria-label="Draggable canvas of workshops and competitions. Use arrow keys to pan."
        >
          <div ref={worldRef} className={styles.world}>
            {tiles.map((tile) =>
              tile.items.map((it) => (
                <Link
                  key={`${tile.key}-${it.id}`}
                  href={it.href}
                  className={styles.name}
                  style={{ left: it.x, top: it.y, rotate: `${it.r}deg`, fontSize: it.size }}
                  tabIndex={tile.key === "0:0" ? 0 : -1}
                  aria-hidden={tile.key === "0:0" ? undefined : true}
                  draggable={false}
                  data-cursor="VIEW"
                  onPointerEnter={() => onEnterItem(it)}
                  onPointerLeave={onLeaveItem}
                  onFocus={() => onEnterItem(it)}
                  onBlur={onLeaveItem}
                >
                  <small>{it.kind}</small>
                  {it.name}
                </Link>
              )),
            )}
          </div>
          <div ref={previewRef} className={styles.preview} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- swapped imperatively on hover */}
            <img alt="" />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
