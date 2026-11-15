import type { EventExtras } from "@/types/event";

/**
 * Extra per-event facts used by the home scenes, /map and the events filters.
 * `days` are taken from the rounds/stats text in event-details.ts.
 * Everything else is unknown in the repo and stays null until confirmed.
 */
const unknown = (): EventExtras => ({
  time: null, // TODO: confirm value
  mapPin: null, // TODO: confirm value
  days: [],
});

export const eventExtras: Record<string, EventExtras> = {
  "hack-the-hardware": unknown(),
  hackathon: { ...unknown(), days: [1, 2] }, // "19–20 Dec 2026, 24-hour"
  envision: unknown(),
  vortex: { ...unknown(), days: [2] }, // "Grand Finale 20 Dec 2026"; earlier rounds online
  "gamer-conquest": { ...unknown(), days: [1, 2] }, // "Day 1: Qualifiers | Day 2: Finals"
  ctf: unknown(),
  "build-the-brand": unknown(),
  "coastal-clash": unknown(), // stats say 18–19 Dec, which conflicts with the fest dates. TODO: confirm value
  "robo-sumo": {
    ...unknown(),
    days: [1, 2], // "Day 1: Qualifiers | Day 2: Knockout Finals"
    arena: {
      size: null, // TODO: confirm value — the rulebook in the repo gives bot size, not arena size
      weightClasses: ["Up to 5 kg"], // from rules: "Maximum permitted robot weight is 5 kg"
    },
  },
  overdrive: { ...unknown(), days: [1, 2] }, // "Day 1: 1v1 Race | Day 2: Time Challenge"
  techquest: unknown(),
  "ai-agent-arena": unknown(),
  designx: unknown(),
};

export const getEventExtras = (slug: string): EventExtras => eventExtras[slug] ?? unknown();
