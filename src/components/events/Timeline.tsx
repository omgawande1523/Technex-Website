'use client';

import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { SceneState } from '@/lib/event-scene-state';

interface Props {
  state: MutableRefObject<SceneState>;
  active: number;
  items: string[];
  onSelect: (index: number) => void;
}

/**
 * Bottom ruler: numbered stops slide sideways as you scroll while the circle
 * in the middle always shows the current event. Click a number to jump to it.
 */
export default function Timeline({ state, active, items, onSelect }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const minor = useRef<HTMLDivElement>(null);
  const major = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = root.current;
      if (!el) return;
      const s = state.current;
            const w = el.clientWidth;
      // multiple of 6 → ticks land on whole pixels (crisp, no shimmer)
      const gap = Math.round(Math.max(48, Math.min(96, w * 0.058)) / 6) * 6;
      el.style.setProperty('--gap', `${gap}px`);

      const px = Math.round(w / 2 - s.cur * gap);
      if (minor.current) minor.current.style.backgroundPosition = `${px}px 0`;
      if (major.current) major.current.style.backgroundPosition = `${px}px 0`;

      const intro = Math.min(1, s.intro * 1.2);
      itemRefs.current.forEach((btn, i) => {
        if (!btn) return;
        const d = i - s.cur;
        const dx = d * gap;
        const nearCentre = Math.min(1, Math.max(0, (Math.abs(d) - 0.4) / 0.5));
        const onScreen = Math.abs(dx) < w / 2 - 24 ? 1 : 0;
        const o = nearCentre * onScreen * 0.75 * intro;
        btn.style.transform = `translateX(calc(-50% + ${dx.toFixed(1)}px))`;
        btn.style.opacity = o.toFixed(3);
        btn.style.pointerEvents = o > 0.05 ? 'auto' : 'none';
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  return (
    <nav className="ev-timeline" ref={root} aria-label="Events">
      <div className="ev-tl-items">
        {items.map((label, i) => (
          <button
            key={label}
            type="button"
            className="ev-tl-item"
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            onClick={() => onSelect(i)}
            aria-label={`Go to event ${label}`}
            aria-current={i === active ? 'true' : undefined}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ev-tl-circle" aria-hidden="true">
        <span key={active}>{items[active]}</span>
      </div>
      <div className="ev-ruler" aria-hidden="true">
        <div className="ev-ruler-minor" ref={minor} />
        <div className="ev-ruler-major" ref={major} />
      </div>
      <div className="ev-tl-pointer" aria-hidden="true" />
    </nav>
  );
}
