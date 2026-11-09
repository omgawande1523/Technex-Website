'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MutableRefObject, SyntheticEvent } from 'react';
import type { SceneState } from '@/lib/event-scene-state';

/**
 * Logo card. Put the logo in  public/events/  and name it with the event number:
 *   01.png  02.jpg  03.webp …   (.png .jpg .jpeg .webp all work)
 * The title-based name also works, e.g. hackathon.png, robo-sumo.png.
 * Uses the .lc-* styles from globals.css (no Tailwind needed).
 */
const EXTS = ['png', 'jpg', 'jpeg', 'webp'];
const EDGE_LAYERS = 6;
const EMBERS = 16;

interface Props {
  id: string; // "01" … "12"
  title: string;
  index: number;
  state?: MutableRefObject<SceneState>;
  /** optional fixed glow colour, 0-360 (270 purple, 150 green, 200 blue) */
  hue?: number;
}

const slug = (t: string) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** every file we are willing to try, in order */
function buildUrls(id: string, title: string): string[] {
  const noVersion = title.replace(/[\s\d.]+$/, '');
  const names = Array.from(
    new Set([
      id, // 02
      slug(title), // hackathon
      slug(noVersion), // overdrive (title without "8.0")
      title.trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // Hack-The-Hardware
    ]),
  ).filter(Boolean);
  return names.flatMap((n) => EXTS.map((e) => `/events/${n}.${e}`));
}

/** deterministic 0…1 so server and client render the same embers */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* one shared pointer listener for all cards */
type Sub = (x: number, y: number) => void;
const subs = new Set<Sub>();
let pending = 0;
let mx = 0;
let my = 0;

function onMove(e: PointerEvent) {
  mx = e.clientX / window.innerWidth - 0.5;
  my = e.clientY / window.innerHeight - 0.5;
  if (pending) return;
  pending = requestAnimationFrame(() => {
    pending = 0;
    subs.forEach((f) => f(mx, my));
  });
}

function subscribe(f: Sub) {
  if (subs.size === 0) window.addEventListener('pointermove', onMove, { passive: true });
  subs.add(f);
  return () => {
    subs.delete(f);
    if (subs.size === 0) {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(pending);
      pending = 0;
    }
  };
}

/** most vivid hue in the picture, so the glow matches every logo automatically */
function vividHue(img: HTMLImageElement): number | null {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return null;
    g.drawImage(img, 0, 0, 32, 32);
    const d = g.getImageData(0, 0, 32, 32).data;
    const bins = new Float32Array(36);
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255;
      const gg = d[i + 1] / 255;
      const b = d[i + 2] / 255;
      const mxv = Math.max(r, gg, b);
      const mnv = Math.min(r, gg, b);
      const l = (mxv + mnv) / 2;
      const s = mxv === mnv ? 0 : (mxv - mnv) / (1 - Math.abs(2 * l - 1));
      if (l < 0.18 || l > 0.9 || s < 0.35) continue;
      let h: number;
      if (mxv === r) h = ((gg - b) / (mxv - mnv)) % 6;
      else if (mxv === gg) h = (b - r) / (mxv - mnv) + 2;
      else h = (r - gg) / (mxv - mnv) + 4;
      h = (h * 60 + 360) % 360;
      bins[Math.floor(h / 10) % 36] += s * (1 - Math.abs(l - 0.55));
    }
    let best = 0;
    let bi = -1;
    bins.forEach((v, i) => {
      if (v > best) {
        best = v;
        bi = i;
      }
    });
    return bi < 0 ? null : bi * 10 + 5;
  } catch {
    return null;
  }
}

export default function LogoCard({ id, title, index, hue }: Props) {
  const slab = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [urls] = useState(() => buildUrls(id, title));
  const [attempt, setAttempt] = useState(0);
  const [extractedHue, setExtractedHue] = useState<number | null>(null);

  const failed = attempt >= urls.length;
  const src = failed ? null : urls[attempt];
  const activeHue = hue ?? extractedHue ?? (index * 47 + 20) % 360;

  const next = () => setAttempt((a) => (a === attempt ? a + 1 : a));

  /* an <img> that already failed before React attached onError (server render) */
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  useEffect(() => {
    if (failed) {
      console.warn(`[LogoCard] no image found for "${title}". Tried:`, urls);
    }
  }, [failed, title, urls]);

  /* 3D tilt + parallax */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return subscribe((x, y) => {
      const s = slab.current;
      const a = art.current;
      if (!s || !a) return;
      s.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg)`;
      s.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(0)}%`);
      s.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(0)}%`);
      a.style.setProperty('--px', `${(x * -10).toFixed(1)}px`);
      a.style.setProperty('--py', `${(y * -8).toFixed(1)}px`);
    });
  }, []);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (hue !== undefined) return;
    const h = vividHue(e.currentTarget);
    if (h !== null) setExtractedHue(h);
  };

  return (
    <div
      className={`lc${id === '01' ? ' lc-hack-the-hardware' : ''}`}
      style={{ '--h': activeHue } as CSSProperties}
    >
      <div className="lc-bg" />
      <i className="lc-beam lc-b1" />
      <i className="lc-beam lc-b2" />
      <i className="lc-beam lc-b3" />
      <i className="lc-floor" />

      {Array.from({ length: EMBERS }).map((_, i) => (
        <i
          key={i}
          className={`lc-ember${i % 4 === 0 ? ' is-streak' : ''}`}
          style={
            {
              '--x': `${(rnd(i, 1) * 100).toFixed(1)}%`,
              '--y': `${(45 + rnd(i, 2) * 55).toFixed(1)}%`,
              '--s': (0.6 + rnd(i, 3) * 1.2).toFixed(2),
              '--d': `${(5 + rnd(i, 4) * 6).toFixed(1)}s`,
              '--dl': `${(-rnd(i, 5) * 8).toFixed(1)}s`,
            } as CSSProperties
          }
        />
      ))}

      <div className="lc-stage">
        <div className="lc-slab" ref={slab} style={{ transition: 'transform 0.25s ease-out' }}>
          {Array.from({ length: EDGE_LAYERS }).map((_, i) => (
            <i
              key={i}
              className="lc-edge"
              style={{ transform: `translateZ(${(-(i + 1) * 1.6).toFixed(1)}px)` }}
            />
          ))}

          <div className="lc-plate">
            <div className="lc-art" ref={art}>
              {src ? (
                <>
                  <img className="lc-blur" src={src} alt="" aria-hidden="true" draggable={false} />
                  <img
                    ref={imgRef}
                    className="lc-logo"
                    src={src}
                    alt={title}
                    draggable={false}
                    onError={next}
                    onLoad={handleLoad}
                  />
                </>
              ) : (
                <div className="lc-ph">
                  <span>{id}</span>
                  <em>{title}</em>
                </div>
              )}
              <div className="lc-grid" />
            </div>
          </div>

          <div className="lc-frame" aria-hidden="true">
            <i className="lc-c lc-tl" />
            <i className="lc-c lc-tr" />
            <i className="lc-c lc-bl" />
            <i className="lc-c lc-br" />
          </div>
          <div className="lc-glare" />
        </div>
      </div>
    </div>
  );
}