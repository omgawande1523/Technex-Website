# INKARNATE — hand-over notes

Branch `feat/inkarnate-scroll` (local only, never pushed). It includes `feat/inkarnate-routes` (functional routes + SEO), merged with `--no-ff`.
Plan and per-scene breakdown: `PLAN.md`.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npx next start
```

Environment variables used by the new code (all optional; pages fall back to an honest "not configured" state):

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | metadataBase, sitemap, robots, JSON-LD | **TODO: confirm** the production domain. Falls back to `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | live fees on `/passes`, `/profile` lookups | existing backend |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `/profile` sign-in, `/accommodation` | existing Supabase project |
| `NEXT_PUBLIC_FEATURE_ACCOMMODATION=true` | turns on `/accommodation` (404 otherwise) | needs the SQL below first |
| `CERTIFICATES_API_URL` | `/api/certificates` | until set, the route returns 501 |

## Every `TODO: confirm` data field

| Field | Where | Current value | Why it needs confirming |
|---|---|---|---|
| `festival.startsAt` / `endsAt` | `src/data/festival.ts` | 19 Dec 2026 09:00 IST → 20 Dec 2026 18:00 IST | Most events say 19–20 Dec, but `siteConfig.dates` (events.ts) and Coastal Clash say 18–19 Dec. **Times are placeholders** (none in the repo); the countdown uses them |
| `festival.coordinates` | `src/data/festival.ts` | 21.0046708, 79.0477332 | Read from the place pin of the Google Maps link already on /contact |
| `eventExtras[*].time` | `src/constants/event-extras.ts` | `null` (shown as TBA) | No start times in the repo; Overdrive ticker shows TIME TBA |
| `eventExtras[*].mapPin` | `src/constants/event-extras.ts` | `null` for all 13 events | No venue locations; `/map` shows them in a "Location TBA" tray |
| `eventExtras["coastal-clash"]` | same | days `[]` | Its stats say 18–19 Dec, which conflicts with the fest dates |
| `eventExtras["robo-sumo"].arena.size` | same | `null` (TBA) | The rulebook gives bot size (350×350×300 mm), not arena size |
| `eventExtras["robo-sumo"].arena.weightClasses` | same | `["Up to 5 kg"]` | Taken from the rules (5 kg, 1% tolerance); confirm there is only one class |
| `Workshop.day` | `src/types/workshop.ts` | unset for every workshop | No workshop schedule; the Workshops canvas Day tabs only use event days |
| `passTiers` | `src/data/passes.ts` | `[]` | No pass tiers exist; `/passes` lists real per-event / per-workshop registration |
| `Dignitary.bio` | `src/data/speakers.ts` | unset | No bios; hover panels show the guest's quote |
| 26-27 conclave line-up | `src/data/speakers.ts` | — | Only **previous** guests exist; the home scene says so |
| Accommodation details | `src/app/accommodation/page.tsx` | TBA | Location, tariff, check-in rules |
| Site URL | `src/lib/content.ts` | env fallback | See `NEXT_PUBLIC_SITE_URL` |
| JSON-LD event times | `src/lib/content.ts` (`eventJsonLd`) | festival window | Per-event times unknown |
| Certificates backend | `src/app/api/certificates/route.ts` | stub (501) | No certificate service exists |
| "My registrations" API | `src/lib/api.ts`, `ProfileClient.tsx` | lookup by registration code | Backend has no `/me` endpoint |

## Placeholder assets that need real art or footage

| Asset | Where | Replace with |
|---|---|---|
| Overdrive frame sequence (150 + 75 WebP, flagged "Placeholder footage" in the UI) | `public/sequences/overdrive/` | Real race footage (see below) |
| Comic panels (13 generated SVGs) | `public/comics/*.svg`, `scripts/generate-ink-panels.ts` | Commissioned ink panels. These replaced the DC-style covers |
| Wordmark ink texture | `public/ink/flow.webp` (from `flow.svg`) | Filmed/scanned ink, as a texture or short loop |
| Ink splash mask (route wipe + preloader) | `public/ink/splash.svg`, `src/components/chrome/splashPath.ts` | A scanned ink splat (keep one closed shape) |
| CRT TV, Robo Sumo ring/bots, Worlds line art, portal frame | CSS/SVG in each scene folder | Fine as is, or swap for illustrated versions |
| Ambient sound | `src/lib/sound.ts` (WebAudio synthesis, no files) | Recorded pen/paper foley if wanted |
| Gamers Conquest poster | `public/assets/events/Gamer Conquest.webp` | Says "2.0"; the data says "3.0" |
| Events with no poster (BIZCON, Agentic Arena, DesignX) | event-details `image: ""` | Posters; the generated ink panel is used meanwhile |

## Swap real frames into Overdrive

1. Export the clip (any length, 16:9, ideally 4–8 s) as MP4.
2. `node scripts/extract-frames.mjs --input path/to/overdrive.mp4 --frames 150`
   - writes `public/sequences/overdrive/desktop/` (150 frames, 1280 px), `mobile/` (75 frames, 640 px) and `manifest.json` with `"placeholder": false`.
   - `--frames` accepts 24–240; mobile always gets half.
3. Reload; the "Placeholder footage" chip disappears because the manifest says so. No code changes.
4. Budget: the placeholder is ~26 KB/frame (3.9 MB desktop, 0.9 MB mobile). Keep real footage at a similar size: lower `-quality` in the script, or use fewer frames.

`ffmpeg` and `ffprobe` must be on PATH. `--placeholder` regenerates the procedural ink tunnel.

## Other scripts

| Script | Purpose |
|---|---|
| `node scripts/optimize-models.mjs` | Re-compress `public/models/*.glb` (meshopt; KTX2 textures when `toktx` from KTX-Software is on PATH, WebP otherwise). Originals are kept in `.cache/models-original/` (git-ignored). The current files used WebP because `toktx` was not installed. Install KTX-Software and re-run to get KTX2 |
| `npx tsx scripts/generate-ink-panels.ts` | Regenerate the SVG comic panels from event-details |
| `npx tsx scripts/text-to-path.ts` | Regenerate the finale glyph paths. **Re-run if `festival.name` changes** |

Model sizes after re-compression: neural network 2.3 MB → 58 KB, flying machine 780 → 157 KB, male body 1.4 MB → 236 KB, paddle boat 1.3 MB → 73 KB.

## Lighthouse (production build, `next start`, local machine)

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Mobile, simulated throttling (3 runs) | 95 / 94 / 84 | 100 | 100 | 100 | 2.9 / 3.0 / 4.5 s | 10–20 ms | 0.004 |
| Mobile, DevTools throttling | 85 | — | — | — | **1.8 s** | 200 ms | — |
| Desktop | 99 | — | — | — | 0.8 s | 0 ms | — |

- The ≥ 85 mobile target is met in 2 of 3 simulated runs and the DevTools-throttled run.
- LCP < 2.5 s is met with real throttling (1.8 s). Lighthouse's simulated estimate is 2.9–3.0 s; that is the number to watch on the deployed site.
- The LCP element is the hero wordmark, which is server-rendered.
- Measured on first visit, so the Enter gate is showing. Re-measure on the real host and CDN.

## Known gaps and deviations

- **`/admin/test-api`**: the production body is the 404 page, but the status is 200 (soft 404). The client admin shell streams before the nested `notFound()`. Delete the route if a hard 404 matters.
- **Lint**: `npm run lint` reports 19 errors, all pre-existing (admin pages, registration form, TeamManager, chatbot, particle-system, DarkSoulsHoloCard). It reported the same 19 before this branch. New code has none. Warnings went from 68 to 44.
- **Two font families**: Barge (display) and Outfit (body), self-hosted.
  - The Workshops canvas uses Barge *italic* as its "handwritten" face, rather than adding a third family.
  - The legacy holo card still loads its own `Fragment Mono`.
  - Every route's Google Fonts `@import` was removed, so older pages now render in these two families.
- **Copyright**: the DC/Marvel covers, the Superman model and the Marvel names in the data are gone. These still name other third-party works and should be reviewed:
  - event "source" fields: Star Trek, Ready Player One, Real Steel, Speed Racer, The Imitation Game, Sherlock Holmes, Shark Tank
  - `DarkSoulsHoloCard` / `public/landing-pages/dark-souls-*` (a trademark in a file name)
- **View Transitions**: the ink wipe uses React `<ViewTransition>` (`app/template.tsx`) with the `ink` transition type where supported, and a GSAP mask wipe elsewhere. Browser back/forward navigations are not animated (they carry no transition type).
- **`/profile`**: Google sign-in goes through a new `/auth/participant-callback`; the admin `/auth/callback` is unchanged. Registrations are tracked by code (saved per user in localStorage). Team editing is read-only because the backend has no team-update endpoint.
- **`/events` finder**: it sits below the existing particle canvas, with a floating "Find an event ↓" button. `EventsExperience.tsx` is not mounted by any route.
- **Untested against live services**: Supabase sign-in, the accommodation insert, live fees and registration lookups. No keys were available.
- **Accommodation table** (run before enabling the flag):

```sql
create table public.accommodation_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null, email text not null, phone text not null, college text not null,
  check_in date not null, check_out date not null,
  guests smallint not null check (guests between 1 and 10),
  notes text, status text not null default 'pending'
);
alter table public.accommodation_requests enable row level security;
create policy "anyone can request" on public.accommodation_requests
  for insert to anon, authenticated with check (status = 'pending');
```

## Where things live

- Home story: `src/components/home/HomeStory.tsx`. Scenes are in `src/components/home/scenes/<Name>/` (`index.tsx`, `use<Name>Timeline.ts`, `<name>.module.css`).
- Content selectors: `src/lib/content.ts`.
  - Data: `src/data/{festival,speakers,passes}.ts`, `src/constants/event-extras.ts`.
- Chrome: `src/components/chrome/` (Preloader, Hud, MegaMenu, InkTransition, InkCursor).
- GSAP plugin registry: `src/lib/gsap.ts`. Lenis: `src/components/providers/SmoothScroll.tsx`.
- R3F hologram and halftone pass: `src/components/three/`.
