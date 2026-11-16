# TECHNEX 26-27 · INKARNATE

The frontend for **TECHNEX 2026–27**, the annual technical festival of St. Vincent Pallotti College of Engineering & Technology (SVPCET), Nagpur.
The home page is a cinematic scroll story in gold ink on black paper; every other route (events, workshops, registration, admin) keeps its own pages.

## Quick start

Prerequisites: Node.js 22+, npm, Git. `ffmpeg` is only needed for `scripts/extract-frames.mjs`.

```bash
git clone https://github.com/omgawande1523/Technex-Website.git
cd Technex-Website
npm install
npm run dev          # http://localhost:3000
```

Production check:

```bash
npm run build
npm run lint
npx next start
```

> Next.js 16 / React 19. Framework APIs differ from older versions: read `AGENTS.md` and `node_modules/next/dist/docs/` before changing routing, metadata, fonts or images.

## Environment variables

Create `.env.local` (git-ignored). Names only; ask the team for values. Every page works without them and shows a "not configured" state instead.

| Name | Used for |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL: metadata, sitemap, robots, JSON-LD |
| `NEXT_PUBLIC_API_URL` | Backend API: registration, fees, payments, admin |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (auth, accommodation requests) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_FEATURE_ACCOMMODATION` | `true` enables `/accommodation` |
| `CERTIFICATES_API_URL` | Certificate lookup backend (`/api/certificates` returns 501 without it) |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_EMBEDDING_MODEL` | TECHNEX AI chatbot (`/api/chat`) |
| `CHAT_MAX_TOKENS`, `RAG_TOP_K`, `RAG_MIN_SIMILARITY`, `RAG_CONTEXT_MAX_CHARS`, `SITE_NAME`, `SITE_URL` | Chatbot tuning |

## How the home page is built

```text
src/
├── app/
│   ├── page.tsx            → <HomeStory />
│   ├── layout.tsx          fonts, SmoothScroll (Lenis), SiteChrome, inline gate script
│   └── template.tsx        <ViewTransition> for the ink route wipe
├── components/
│   ├── home/
│   │   ├── HomeStory.tsx   scene order; every scene after the hero is a lazy chunk
│   │   ├── SceneShell.tsx  lazy mount (IntersectionObserver) + data-hud label for the HUD
│   │   └── scenes/<Name>/  index.tsx · use<Name>Timeline.ts · <name>.module.css
│   ├── chrome/             Enter gate, HUD, mega menu, route transition, cursor
│   ├── three/              React Three Fiber hologram + halftone post-process
│   └── providers/          Lenis smooth scroll on GSAP's ticker
└── lib/
    ├── content.ts          the ONLY content source for new sections
    ├── gsap.ts             registers GSAP plugins once
    └── preload.ts, hud.ts, sound.ts
```

- **Scenes**, in order: Hero → Portal → Worlds → Gamer Conquest (playable mini-game) → Overdrive (scroll-scrubbed frames) → Robo Sumo → ink dissolve → Tech Conclave → Workshops canvas → Memory lane → Sponsors → Finale. Each scene owns one pinned GSAP ScrollTrigger timeline and has a mobile (< 768px) and a reduced-motion fallback.
- **`src/lib/content.ts`** reshapes the existing data (`src/constants/*`, `src/data/*`, the API layer). Components never hardcode copy. Unknown facts are `null` with `// TODO: confirm value` and render as **TBA**.
- GSAP owns scroll, Lenis smooths it, and `motion` is used only for small UI states.

## Scripts

| Command | What it does |
|---|---|
| `node scripts/optimize-models.mjs` | Re-compresses `public/models/*.glb` with meshopt. Textures become KTX2 when `toktx` (KTX-Software) is on PATH, WebP otherwise. Originals are kept in `.cache/models-original/` |
| `node scripts/extract-frames.mjs --input clip.mp4 [--frames 150]` | Turns a video into the Overdrive WebP image sequence (desktop + half-count mobile) and writes `manifest.json` |
| `node scripts/extract-frames.mjs --placeholder` | Regenerates the procedural placeholder sequence |
| `npx tsx scripts/generate-ink-panels.ts` | Regenerates the SVG ink panels in `public/comics/` from event data |
| `npx tsx scripts/text-to-path.ts` | Regenerates the finale lettering from `festival.name` |
| `npm run ingest:knowledge` | Rebuilds the chatbot knowledge index |

## More

- `PLAN.md`: per-scene plan (data source, library, mobile fallback).
- `INKARNATE_NOTES.md`: open data TODOs, placeholder assets, Lighthouse results, the Overdrive frame swap, known gaps.
