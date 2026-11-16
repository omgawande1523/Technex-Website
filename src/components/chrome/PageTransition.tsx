"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import styles from "./chrome.module.css";

/**
 * Route transition: the old page settles back and blurs out while the new one
 * rises into focus.
 *
 * Internal link clicks are intercepted and pushed with the "page" transition
 * type. Where the browser supports the View Transitions API, React's
 * <ViewTransition> in app/template.tsx animates it (CSS in globals.css).
 * Elsewhere a GSAP overlay fades to black, navigates, then fades back.
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      if (a.closest('[data-suppress-click="true"]')) return; // end of a drag, not a click
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page / hash links
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;
      if (prefersReducedMotion()) return; // let Next handle it, no animation

      e.preventDefault();
      const href = url.pathname + url.search + url.hash;

      if ("startViewTransition" in document) {
        router.push(href, { transitionTypes: ["page"] });
        return;
      }
      // GSAP fallback: fade to black, navigate, then fade back.
      const el = overlayRef.current;
      if (!el) {
        router.push(href);
        return;
      }
      gsap.killTweensOf(el);
      gsap.set(el, { autoAlpha: 0 });
      gsap.to(el, {
        autoAlpha: 1,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          pendingRef.current = () => gsap.to(el, { autoAlpha: 0, duration: 0.45, ease: "power2.out", delay: 0.05 });
          router.push(href);
        },
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    pendingRef.current?.();
    pendingRef.current = null;
  }, [pathname]);

  return <div ref={overlayRef} className={styles.pageOverlay} aria-hidden="true" />;
}
