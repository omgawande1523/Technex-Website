"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { festival, festivalDates, navRoutes, type NavRoute } from "@/lib/content";
import styles from "./chrome.module.css";

export default function MegaMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const routes = navRoutes();
  const groups = routes.reduce<Record<string, NavRoute[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  let index = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mega-menu"
          ref={panelRef}
          className={styles.menu}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at 96% 4%)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at 96% 4%)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at 96% 4%)" }}
          transition={{ duration: reduce ? 0.15 : 0.7, ease: [0.7, 0, 0.2, 1] }}
        >
          <div className={styles.menuHalftone} aria-hidden="true" />
          <nav className={styles.menuGrid} aria-label="All pages">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group} className={styles.menuGroup}>
                <p className={styles.menuGroupTitle}>{group}</p>
                <ul>
                  {items.map((r) => {
                    const i = index++;
                    const active = r.href === "/" ? pathname === "/" : pathname.startsWith(r.href);
                    return (
                      <motion.li
                        key={r.href}
                        initial={reduce ? false : { opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduce ? 0 : 0.25 + i * 0.04, duration: 0.5 }}
                      >
                        <Link
                          href={r.href}
                          className={styles.menuLink}
                          aria-current={active ? "page" : undefined}
                          onClick={onClose}
                        >
                          <span className={styles.menuIndex}>{String(i + 1).padStart(2, "0")}</span>
                          {r.label}
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <footer className={styles.menuFooter}>
            <p>
              {festival.name} {festival.edition} · {festivalDates().label} · {festival.hostShort}, {festival.city}
            </p>
            <p>
              <a href={`mailto:${festival.email}`}>{festival.email}</a>
              {" · "}
              <a href={festival.phoneHref}>{festival.phone}</a>
            </p>
            <ul className={styles.menuSocials}>
              {festival.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
