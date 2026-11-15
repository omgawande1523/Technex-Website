"use client";

import { useSyncExternalStore } from "react";

function media(query: string) {
  return {
    subscribe(cb: () => void) {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const reducedQ = media("(prefers-reduced-motion: reduce)");
const mobileQ = media("(max-width: 767px)");
const hydrated = { subscribe: () => () => {}, get: () => true };

/**
 * Viewport facts every scene branches on. Server render assumes desktop with
 * motion; `hydrated` lets scenes skip client-only work until it is true.
 */
export function useSceneEnv() {
  const reduced = useSyncExternalStore(reducedQ.subscribe, reducedQ.get, () => false);
  const mobile = useSyncExternalStore(mobileQ.subscribe, mobileQ.get, () => false);
  const isClient = useSyncExternalStore(hydrated.subscribe, hydrated.get, () => false);
  return { reduced, mobile, hydrated: isClient };
}
