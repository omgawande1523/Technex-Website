import type { EventItem } from "@/types/event";
import { workshops } from "@/constants/workshops";

// Update each workshop's information here. Missing information is deliberately
// left as "To be announced" rather than copied from similarly named events.
// Contact emails are supported by the existing details UI as an optional field.
type WorkshopDetails = EventItem & {
  contacts: Array<EventItem["contacts"][number] & { email?: string }>;
};

const detailsBySlug: Record<string, Partial<WorkshopDetails>> = {
  hackathon: {
    domains: ["Software Development", "Applications", "Modern Frameworks"],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
  },
  gameathon: {
    domains: ["Game Design", "Programming", "Playable Projects"],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
  },
  envision: {
    domains: ["Data Collection", "Preprocessing", "Data Visualization"],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
  },
  designx: {
    domains: ["Digital Design", "Infrastructure Modelling"],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
  },
  "coastal-clash": {
    domains: ["RC Boats", "Marine Engineering", "Boat Stability"],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
  },
  mind2market: {
    domains: ["Competitive Coding", "Problem Solving"],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
  },
};

export const workshopDetails: WorkshopDetails[] = workshops.map((workshop, index) => {
  const slug = workshop.slug || workshop.id;
  const overrides = detailsBySlug[slug] ?? {};
  return {
    slug,
    number: String(index + 1).padStart(2, "0"),
    name: workshop.title,
    category: workshop.category,
    tagline: "TECHNEX 2026 · Hands-on Workshop",
    quote: "Learn. Build. Innovate.",
    about: workshop.description,
    domains: [workshop.category],
    source: { title: "Workshop overview", text: workshop.description },
    innovation: { title: "Practical learning", text: workshop.description },
    stats: [
      { icon: "calendar", label: "Date", value: "To be announced" },
      { icon: "pin", label: "Venue", value: "To be announced" },
      { icon: "team", label: "Participation", value: "To be announced" },
      { icon: "trophy", label: "Registration Fee", value: "To be announced" },
    ],
    rounds: [{ title: "Workshop session", text: "Session agenda will be announced by the organizers." }],
    rules: [{ title: "Guidelines", text: "Official workshop guidelines will be announced." }],
    faqs: [
      { q: "When is the workshop?", a: "The schedule will be announced by the organizers." },
      { q: "How do I register?", a: "Use the Register now button to open the workshop registration form." },
      { q: "What is the registration fee?", a: "The fee is shown in the official registration form when available." },
    ],
    contacts: [],
    registerUrl: `/workshops/${encodeURIComponent(slug)}/register`,
    rulebookUrl: "",
    shape: "ship",
    image: workshop.image,
    perks: [],
    whoCanJoin: "Participation requirements will be announced by the organizers.",
    ...overrides,
  };
});

export function getWorkshopDetail(slug: string): WorkshopDetails | undefined {
  return workshopDetails.find((workshop) => workshop.slug === slug);
}
