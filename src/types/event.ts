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
