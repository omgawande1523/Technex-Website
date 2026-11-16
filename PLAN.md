# INKARNATE — home scroll story plan

Branch: `feat/inkarnate-scroll` (local only, never pushed).
Identity: gold ink (`#d9ad62`) on black paper. Halftone, brush strokes, ink bleed.
Behaviour reference only: pinned scenes, portals, mini-game, scrubbed video, draggable canvas, section HUD.

## Ground rules

- Every new section imports content from **`src/lib/content.ts`** (typed selectors).
  `content.ts` reads `src/constants/*`, `src/data/*`, `src/types/*`, and the API/Supabase layer. No copy in components.
- Missing facts are added to the data source with `// TODO: confirm value`. Unknown values stay `null`
  and the UI shows "TBA". Nothing real-looking is invented.
- GSAP owns scroll (one pinned `ScrollTrigger` timeline per scene). Lenis drives smooth scroll on GSAP's ticker.
  `motion` is used only for small UI state (menu, chips, lightbox).
- Each scene: `src/components/home/scenes/<Name>/index.tsx`, `use<Name>Timeline.ts`, `<name>.module.css`.
- Each scene is lazy-mounted (IntersectionObserver, 1 viewport of root margin) and has a
  `prefers-reduced-motion` static fallback, plus a simpler mobile variant (< 768px).

## Data gaps found while reading the repo

| Need | Found | Action |
|---|---|---|
| Fest dates | Most events say 19–20 Dec 2026; `siteConfig.dates` and Coastal Clash say 18–19 Dec | `festival.startsAt/endsAt` = 19–20 Dec, `TODO: confirm` |
| Campus GPS | not in repo | `festival.coordinates`, `TODO: confirm` |
| Speakers | inline in `AboutSection.tsx` as **previous** guests | moved to `src/data/speakers.ts`; the scene labels them as past guests |
| Robo Sumo arena size / weight classes | rules give bot size (350×350×300 mm) and one 5 kg limit; arena size absent | `arenaSize: null` (TBA), weight class read from rules, `TODO: confirm` |
| Event time of day | absent | `timeOfDay: null`, `TODO: confirm` |
| Pronite / day-wise artists | absent | scene becomes a **Workshops canvas** (as instructed) |
| Workshop day | absent | optional `day` field on `Workshop`, `TODO: confirm`; tabs fall back to Workshops / Competitions / All |
| Pass tiers | absent | `src/data/passes.ts` with empty tiers + `TODO`; `/passes` lists real per-event and per-workshop registration |
| Event map locations | absent | `venueLocation` placeholder pins, labelled "location TBA", `TODO: confirm` |
| Certificates backend | absent | `/api/certificates` stub returning 501 + `TODO` |
| Participant "my registrations" API | absent (backend only exposes registration-by-code) | `/profile` uses Supabase auth + registration-code lookup; `TODO` for a `/me` endpoint |

## Global systems

| System | Implementation | Mobile / reduced motion |
|---|---|---|
| Preloader / Enter gate | SVG ink drop → spread → logo; real progress from `document.fonts`, critical images and the hero model; `[ Enter ]` + sound toggle (muted default, WebAudio-synthesised pen/paper noise). `sessionStorage` once per session (try/catch). | Reduced motion: static logo + progress bar |
| HUD | Fixed pill with current scene name (scenes register via `data-scene`), ink progress line, mega-menu (all routes), Register button, scroll chevron | Same, smaller pill |
| Route transitions | Ink-splash SVG mask wipe driven by GSAP, hooked into internal link clicks; native View Transitions used where `document.startViewTransition` exists | Reduced motion: no wipe |
| Cursor | Ink dot → brush blob over interactive elements; magnetic buttons | Desktop + fine pointer only |
| Smooth scroll | Lenis on `gsap.ticker`, `ScrollTrigger.update` on scroll | Disabled for reduced motion and on touch (native scroll) |

## Scenes (home `/`, top → bottom)

| # | Scene (HUD name) | Data source (`content.ts`) | Libraries | Mobile fallback |
|---|---|---|---|---|
| 1 | **Hero** "TECHNEX 26" | `festival` (name, dates, tagline, coordinates), `registerHref` | SVG mask wordmark with ink video/texture, SplitText, R3F `InkHologramCanvas` (ported from raw three) + halftone post-process | No post-processing, lower DPR, static texture |
| 2 | **Portal** "CROSSING" | — (visual) | Pinned GSAP timeline: scale, clip-path, blur ramp | Shorter pin, no blur |
| 3 | **Worlds** "WORLDS" | `worlds()` built from workshops, event categories, speakers, passes | CSS hexagon clip, DrawSVG redraw on hover, 3D tilt, Flip expansion → route | No tilt, tap navigates |
| 4 | **Gamer Conquest** arcade | `getFlagship('gamer-conquest')` | CSS/SVG CRT, canvas shooter (30 s, score, lives, keyboard + touch), `localStorage` high score | Touch controls, smaller canvas |
| 5 | **Overdrive** cinema | `getFlagship('overdrive')`, `tickerItems()` | Canvas image sequence (procedural placeholder frames; `scripts/extract-frames.mjs` for real footage), typewriter spec sheet, marquee | Half the frames |
| 6 | **Robo Sumo** arena | `getFlagship('robo-sumo')` stats | Slam-in title + camera shake, count-up stats, Register → `/register/robo-sumo` | Same, no shake |
| 7 | Ink dissolve transition | — | Canvas pixel dissolve | Crossfade |
| 8 | **Tech Conclave** | `speakers()` | Two columns, vertical title, ink bio panel on hover/focus | Tap to reveal |
| 9 | **Workshops canvas** | `workshops()` (+ events) | Draggable infinite pan, velocity skew reveal, SVG contour background | Native horizontal scroll |
| 10 | **Memory lane** gallery | `/api/media` → `GALLERY_IMAGES` | Scroll-jacked rows, polaroids with depth, lightbox (keyboard) | Swipe row, no pin |
| 11 | **Sponsors** | `sponsors()` from `src/data/sponsors` | Two opposite marquees, pause on hover, title sponsor spotlight | Same |
| 12 | **Finale** "SEE YOU" | `festival`, `contact`, `socials` | DrawSVG handwriting, back-to-top ink drip | Static text |

## Functional routes

`/profile`, `/passes`, `/certificates`, `/map`, `/accommodation` (feature flag `NEXT_PUBLIC_FEATURE_ACCOMMODATION`),
`/events` filter chips + search, SEO (`generateMetadata`, `next/og` per event, `sitemap.ts`, `robots.ts`, JSON-LD `Event`).

## Order of work

1. Clean-up (copyright, junk) ✔
2. Stack (`src/lib/gsap.ts`, Lenis, fonts, globals) → `content.ts` ✔
3. Global systems (preloader, HUD, transitions, cursor) ✔
4. Scenes 1 → 12, one commit each, `npm run build` + `npm run lint` + browser check at 1440 and 390 px ✔
5. Functional routes, SEO ✔ (built on `feat/inkarnate-routes`, merged)
6. GLB re-compression, Lighthouse, `INKARNATE_NOTES.md` ✔ — results and open TODOs are in `INKARNATE_NOTES.md`
