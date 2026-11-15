/**
 * Typed content selectors for the INKARNATE home and the new routes.
 *
 * Every new section imports from here. This module only reshapes data that
 * lives in src/constants, src/data and the API layer; it never introduces copy.
 * Unknown values are null and rendered as "TBA" by the UI.
 */
import { eventDetails } from "@/constants/event-details";
import { getEventExtras } from "@/constants/event-extras";
import { workshops as workshopData } from "@/constants/workshops";
import { festival } from "@/data/festival";
import { passTiers } from "@/data/passes";
import { chiefGuest, previousGuests, type Dignitary } from "@/data/speakers";
import {
  educationSponsors,
  expoSponsors,
  foodSponsors,
  gamingSponsors,
  titleSponsor,
} from "@/data/sponsors";
import type { EventExtras, EventItem, IconKind } from "@/types/event";
import type { MediaItem } from "@/lib/types";
import type { Sponsor } from "@/types/sponsor";
import type { Workshop } from "@/types/workshop";

export { festival };
export type { Dignitary, Sponsor, MediaItem };

export const TBA = "TBA";

/* ------------------------------------------------------------------ */
/* Festival                                                            */
/* ------------------------------------------------------------------ */

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Calendar date parts in IST, independent of the viewer's time zone. */
function istParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000);
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() };
}

export function festivalDates() {
  const start = istParts(festival.startsAt);
  const end = istParts(festival.endsAt);
  const sameMonth = start.month === end.month;
  const label = sameMonth
    ? `${start.day}–${end.day} ${MONTHS[start.month]} ${end.year}`
    : `${start.day} ${MONTHS[start.month]} – ${end.day} ${MONTHS[end.month]} ${end.year}`;
  return {
    startsAt: new Date(festival.startsAt),
    endsAt: new Date(festival.endsAt),
    label,
    dayCount: Math.round((Date.parse(festival.endsAt) - Date.parse(festival.startsAt)) / 86_400_000) + 1,
  };
}

/** "21.0047° N · 79.0477° E" */
export function coordinatesLabel(digits = 4) {
  const { lat, lng } = festival.coordinates;
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(digits)}° ${ns} · ${Math.abs(lng).toFixed(digits)}° ${ew}`;
}

/** Primary call to action across the site. */
export const registerHref = "/passes";

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export interface EventStat {
  icon: IconKind;
  label: string;
  value: string;
  sub?: string;
}

export interface EventSummary {
  slug: string;
  number: string;
  name: string;
  category: string;
  tagline: string;
  quote: string;
  about: string;
  domains: string[];
  /** Poster image, or null when the event has none yet. */
  image: string | null;
  /** Generated ink panel (scripts/generate-ink-panels.ts). Always present. */
  panel: string;
  href: string;
  /** Registration target: internal /register route, external form, or the detail page. */
  registerHref: string;
  registerIsExternal: boolean;
  rulebookUrl: string | null;
  date: string | null;
  venue: string | null;
  teamSize: string | null;
  prize: string | null;
  stats: EventStat[];
  highlights: { value: string; label: string }[];
  extras: EventExtras;
}

const statValue = (ev: EventItem, icon: IconKind) => {
  const v = ev.stats.find((s) => s.icon === icon)?.value?.trim();
  return v && v.toUpperCase() !== TBA ? v : null;
};

function toSummary(ev: EventItem): EventSummary {
  const slug = ev.slug.trim();
  const reg = ev.registerUrl?.trim() ?? "";
  return {
    slug,
    number: ev.number,
    name: ev.name,
    category: ev.category,
    tagline: ev.tagline?.trim() ?? "",
    quote: ev.quote ?? "",
    about: ev.about ?? "",
    domains: ev.domains ?? [],
    image: ev.image?.trim() ? ev.image : null,
    panel: `/comics/${slug}.svg`,
    href: `/events/${slug}`,
    registerHref: reg || `/events/${slug}`,
    registerIsExternal: /^https?:\/\//.test(reg),
    rulebookUrl: ev.rulebookUrl?.trim() ? ev.rulebookUrl : null,
    date: statValue(ev, "calendar"),
    venue: statValue(ev, "pin"),
    teamSize: statValue(ev, "team"),
    prize: statValue(ev, "trophy"),
    stats: ev.stats,
    highlights: ev.highlights ?? [],
    extras: getEventExtras(slug),
  };
}

const EVENTS: EventSummary[] = eventDetails.map(toSummary);

export const allEvents = (): EventSummary[] => EVENTS;
export const getEvent = (slug: string) => EVENTS.find((e) => e.slug === slug) ?? null;
export const eventCategories = (): string[] => [...new Set(EVENTS.map((e) => e.category))];

/** Team-size buckets for the /events filter chips, derived from the "team" stat. */
export function teamSizeBucket(teamSize: string | null): "Solo" | "Team" | "Unknown" {
  if (!teamSize) return "Unknown";
  if (/solo|1v1|^1\b|individual/i.test(teamSize) && !/[2-9]/.test(teamSize)) return "Solo";
  return "Team";
}

/* ------------------------------------------------------------------ */
/* Flagship scenes                                                     */
/* ------------------------------------------------------------------ */

export interface Flagship {
  event: EventSummary;
  /** Uppercase scene label for the HUD. */
  hudName: string;
  /** Spec-sheet rows: every stat, plus start time. */
  specs: { label: string; value: string; sub?: string }[];
  /** Marquee items: EVENT • DATE • TIME • VENUE • PRIZE. */
  ticker: string[];
}

export function getFlagship(slug: string): Flagship | null {
  const event = getEvent(slug);
  if (!event) return null;
  const specs = [
    ...event.stats.map((s) => ({ label: s.label, value: s.value, sub: s.sub })),
    { label: "Start Time", value: event.extras.time ?? TBA },
  ];
  const ticker = [
    event.name,
    event.date ?? `DATES ${TBA}`,
    event.extras.time ?? `TIME ${TBA}`,
    event.venue ?? `VENUE ${TBA}`,
    event.prize ? `PRIZE ${event.prize}` : `PRIZE ${TBA}`,
  ].map((s) => s.toUpperCase());
  return { event, hudName: event.name.toUpperCase(), specs, ticker };
}

/**
 * Splits "₹1,00,000" / "Up to ₹50,000" / "2 Days" / "16" into parts a count-up
 * can animate. Returns null when there is no number to count.
 */
export function numericParts(value: string) {
  const m = value.match(/^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  const n = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  const indian = /\d,\d{2},\d{3}/.test(raw);
  const format = (x: number) =>
    raw.includes(",")
      ? Math.round(x).toLocaleString(indian ? "en-IN" : "en-US")
      : String(Math.round(x));
  return { prefix: m[1], value: n, suffix: m[3], format };
}

/* ------------------------------------------------------------------ */
/* Workshops                                                           */
/* ------------------------------------------------------------------ */

export interface WorkshopSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  cover: string;
  character: string;
  href: string;
  registerHref: string;
  day: number | null;
}

const WORKSHOPS: WorkshopSummary[] = workshopData.map((w: Workshop) => {
  const slug = w.slug ?? w.id;
  return {
    id: w.id,
    slug,
    title: w.title,
    category: w.category ?? "",
    description: w.description ?? "",
    cover: w.cover,
    character: w.character,
    href: `/workshops/${slug}`,
    registerHref: `/workshops/${slug}/register`,
    day: w.day ?? null,
  };
});

export const allWorkshops = (): WorkshopSummary[] => WORKSHOPS;

/* ------------------------------------------------------------------ */
/* People, partners, media                                             */
/* ------------------------------------------------------------------ */

/** Conclave speakers shown on the home page. These are guests of previous editions. */
export const conclave = () => ({
  isPastLineup: true,
  speakers: [chiefGuest, ...previousGuests] as Dignitary[],
});

export function sponsorsContent() {
  const groups = [
    { title: "Expo", sponsors: expoSponsors },
    { title: "Education", sponsors: educationSponsors },
    { title: "Gaming", sponsors: gamingSponsors },
    { title: "Food", sponsors: foodSponsors },
  ];
  const rest = groups.flatMap((g) => g.sponsors);
  const half = Math.ceil(rest.length / 2);
  return { title: titleSponsor, groups, rows: [rest.slice(0, half), rest.slice(half)] as [Sponsor[], Sponsor[]] };
}

/** Gallery photos from the existing media API (GALLERY_IMAGES or public/assets/gallery). */
export async function loadGalleryMedia(signal?: AbortSignal): Promise<MediaItem[]> {
  const res = await fetch("/api/media", { signal });
  if (!res.ok) throw new Error(`Gallery request failed (${res.status})`);
  return (await res.json()) as MediaItem[];
}

export const passes = () => passTiers;

/* ------------------------------------------------------------------ */
/* Worlds grid                                                         */
/* ------------------------------------------------------------------ */

export interface World {
  id: "workshops" | "competitions" | "speakers" | "passes";
  title: string;
  count: number;
  /** Small labels drawn on the card, taken from the data behind the route. */
  labels: string[];
  href: string;
}

export function worlds(): World[] {
  const { speakers } = conclave();
  return [
    {
      id: "workshops",
      title: "Workshops",
      count: WORKSHOPS.length,
      labels: [...new Set(WORKSHOPS.map((w) => w.category).filter(Boolean))],
      href: "/workshops",
    },
    {
      id: "competitions",
      title: "Competitions",
      count: EVENTS.length,
      labels: eventCategories(),
      href: "/events",
    },
    {
      id: "speakers",
      title: "Speakers",
      count: speakers.length,
      labels: speakers.map((s) => s.role),
      href: "/about",
    },
    {
      id: "passes",
      title: "Passes",
      count: passTiers.length || EVENTS.filter((e) => e.registerHref.startsWith("/register/")).length + WORKSHOPS.length,
      labels: passTiers.length ? passTiers.map((p) => p.name) : ["Event registration", "Workshop registration"],
      href: "/passes",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Navigation and scenes                                               */
/* ------------------------------------------------------------------ */

export const accommodationEnabled = process.env.NEXT_PUBLIC_FEATURE_ACCOMMODATION === "true";

export interface NavRoute {
  label: string;
  href: string;
  group: "Festival" | "Participate" | "People";
}

export function navRoutes(): NavRoute[] {
  const routes: NavRoute[] = [
    { label: "Home", href: "/", group: "Festival" },
    { label: "Events", href: "/events", group: "Festival" },
    { label: "Workshops", href: "/workshops", group: "Festival" },
    { label: "Gallery", href: "/gallery", group: "Festival" },
    { label: "Campus Map", href: "/map", group: "Festival" },
    { label: "Passes", href: "/passes", group: "Participate" },
    { label: "Profile", href: "/profile", group: "Participate" },
    { label: "Certificates", href: "/certificates", group: "Participate" },
    { label: "Team", href: "/team", group: "People" },
    { label: "Sponsors", href: "/sponsors", group: "People" },
    { label: "About", href: "/about", group: "People" },
    { label: "Contact", href: "/contact", group: "People" },
  ];
  if (accommodationEnabled) routes.splice(8, 0, { label: "Accommodation", href: "/accommodation", group: "Participate" });
  return routes;
}

/** HUD label for non-home routes. */
export function routeLabel(pathname: string): string {
  if (pathname === "/") return festival.shortName;
  const match = navRoutes()
    .filter((r) => r.href !== "/")
    .find((r) => pathname === r.href || pathname.startsWith(`${r.href}/`));
  if (pathname.startsWith("/events/")) {
    const ev = getEvent(pathname.split("/")[2] ?? "");
    if (ev) return ev.name.toUpperCase();
  }
  if (pathname.startsWith("/register/")) return "REGISTER";
  return (match?.label ?? festival.shortName).toUpperCase();
}

export interface SceneMeta {
  id: string;
  hud: string;
}

/** Order of the home scroll story; ids are used as element ids and HUD keys. */
export function homeScenes(): SceneMeta[] {
  const gc = getFlagship("gamer-conquest");
  const od = getFlagship("overdrive");
  const rs = getFlagship("robo-sumo");
  return [
    { id: "hero", hud: festival.shortName },
    { id: "portal", hud: festival.theme },
    { id: "worlds", hud: "WORLDS" },
    ...(gc ? [{ id: "gamer-conquest", hud: gc.hudName }] : []),
    ...(od ? [{ id: "overdrive", hud: od.hudName }] : []),
    ...(rs ? [{ id: "robo-sumo", hud: rs.hudName }] : []),
    { id: "conclave", hud: "TECH CONCLAVE" },
    { id: "workshops-canvas", hud: "WORKSHOPS" },
    { id: "memory-lane", hud: "MEMORY LANE" },
    { id: "sponsors", hud: "SPONSORS" },
    { id: "finale", hud: `SEE YOU AT ${festival.name}` },
  ];
}
