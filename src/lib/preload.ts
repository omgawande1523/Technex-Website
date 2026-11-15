"use client";

/**
 * Tiny asset-progress registry for the preloader. Anything that must be ready
 * before the Enter gate opens calls `trackAsset(promise, weight)`; the gate
 * shows done/total as a real percentage.
 */
type Listener = (p: { loaded: number; total: number }) => void;

let loaded = 0;
let total = 0;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l({ loaded, total }));

export function trackAsset<T>(promise: Promise<T>, weight = 1): Promise<T> {
  total += weight;
  emit();
  const done = () => {
    loaded += weight;
    emit();
  };
  promise.then(done, done);
  return promise;
}

/** Report fractional progress (0..1) for one long download, e.g. a GLB. */
export function trackProgress(weight = 1) {
  total += weight;
  let reported = 0;
  emit();
  return {
    update(fraction: number) {
      const next = Math.min(1, Math.max(0, fraction)) * weight;
      if (next > reported) {
        loaded += next - reported;
        reported = next;
        emit();
      }
    },
    done() {
      this.update(1);
    },
  };
}

export function subscribeProgress(listener: Listener) {
  listeners.add(listener);
  listener({ loaded, total });
  return () => {
    listeners.delete(listener);
  };
}

export function preloadImage(src: string) {
  return trackAsset(
    new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = src;
    }),
  );
}
