export type IconKind = "calendar" | "pin" | "team" | "trophy";
export type ShapeKind = "ship" | "knot" | "ico" | "octa" | "torus" | "cube";
export interface EventItem {
  slug: string;
  number: string;
  name: string;
  category: string;
  tagline: string;
  quote: string;
  about: string;
  domains: string[];
  source: { title: string; text: string };
  innovation: { title: string; text: string };
  stats: { icon: IconKind; label: string; value: string; sub?: string }[];
  rounds: { title: string; text: string }[];
  rules: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  contacts: { name: string; phone: string; email?: string }[];
  registerUrl: string;
  rulebookUrl: string;
  shape: ShapeKind;
  image?: string;
  highlights?: { value: string; label: string }[];
  perks?: string[];
  whoCanJoin?: string;
}

/**
 * Fields the redesign needs that event-details.ts does not carry.
 * Kept in src/constants/event-extras.ts, keyed by event slug.
 */
export interface EventExtras {
  /** Start time on the day, e.g. "10:00 AM". null = TBA. */
  time: string | null;
  /** Pin on the campus map, in % of the map image. null = location TBA. */
  mapPin: { x: number; y: number; place: string } | null;
  /** Festival day numbers (1-based) the event runs on, when stated in event-details. */
  days: number[];
  /** Arena facts, only for arena events. */
  arena?: { size: string | null; weightClasses: string[] };
}
