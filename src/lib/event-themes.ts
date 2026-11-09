
export type EventTheme = {
  name: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
};

const defaultTheme: EventTheme = {
  name: "Default",
  accent: "#FFD34E",
  accentSoft: "rgba(255, 211, 78, 0.12)",
  accentBorder: "rgba(255, 211, 78, 0.45)",
  accentText: "#FFD34E",
};

// Assign colours manually using actual event slugs.
export const eventThemes: Record<string, EventTheme> = {
  envision: {
    name: "Envision",
    accent: "#55D68B",
    accentSoft: "rgba(85, 214, 139, 0.12)",
    accentBorder: "rgba(85, 214, 139, 0.45)",
    accentText: "#55D68B",
  },

  hackathon: {
    name: "Hackathon",
    accent: "#A78BFA",
    accentSoft: "rgba(167, 139, 250, 0.12)",
    accentBorder: "rgba(167, 139, 250, 0.45)",
    accentText: "#A78BFA",
  },

  coding: {
    name: "Coding",
    accent: "#FFD34E",
    accentSoft: "rgba(255, 211, 78, 0.12)",
    accentBorder: "rgba(255, 211, 78, 0.45)",
    accentText: "#FFD34E",
  },

  ctf: {
    name: "Cybersecurity",
    accent: "#FF6464",
    accentSoft: "rgba(255, 100, 100, 0.12)",
    accentBorder: "rgba(255, 100, 100, 0.45)",
    accentText: "#FF6464",
  },

  gaming: {
    name: "Gaming",
    accent: "#62A9FF",
    accentSoft: "rgba(98, 169, 255, 0.12)",
    accentBorder: "rgba(98, 169, 255, 0.45)",
    accentText: "#62A9FF",
  },

  quiz: {
    name: "Quiz",
    accent: "#FF9C50",
    accentSoft: "rgba(255, 156, 80, 0.12)",
    accentBorder: "rgba(255, 156, 80, 0.45)",
    accentText: "#FF9C50",
  },
};

export function getEventTheme(slug: string): EventTheme {
  return eventThemes[slug.toLowerCase()] ?? defaultTheme;
}
