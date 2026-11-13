export type EventTheme = {
  name: string;
  accent: string;
  accentSecondary: string;
  accentTertiary: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
};

function createTheme(
  name: string,
  accent: string,
  accentSecondary: string,
  accentTertiary = accentSecondary,
): EventTheme {
  const toRgba = (color: string, alpha: number) => {
    const hex = color.slice(1);
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  };

  return {
    name,
    accent,
    accentSecondary,
    accentTertiary,
    accentSoft: toRgba(accent, 0.12),
    accentBorder: toRgba(accentSecondary, 0.45),
    accentText: accentSecondary,
  };
}

const gold = "#D4AF37";
const silver = "#C0C0C0";

const defaultTheme = createTheme("Default", gold, "#F2D675");

// Assign metallic palettes manually using actual event slugs.
export const eventThemes: Record<string, EventTheme> = {
  "hack-the-hardware": createTheme("Hack The Hardware", gold, "#F28C28"),
  hackathon: createTheme("Hackathon", gold, "#9B59B6"),
  envision: createTheme("Envision", gold, "#00A86B"),
  vortex: createTheme("Vortex", gold, "#3B82F6"),
  "gamer-conquest": createTheme("Gamer Conquest", gold, "#F28C28", "#9CA3AF"),
  ctf: createTheme("Apex CTF", gold, "#DC2626", "#9CA3AF"),
  "apex-ctf": createTheme("Apex CTF", gold, "#DC2626", "#9CA3AF"),
  bizcon: createTheme("Bizcon", gold, "#EC4899"),
  "build-the-brand": createTheme("Bizcon", gold, "#EC4899"),
  "coastal-clash": createTheme("Coastal Clash", silver, gold, "#3B82F6"),
  "robo-sumo": createTheme("Robo Sumo", gold, "#EC4899", "#22C55E"),
  overdrive: createTheme("Overdrive", gold, "#8B5CF6", "#EC4899"),
  techquest: createTheme("TechQuest", gold, "#808000"),
  "ai-agent-arena": createTheme("Agentic Arena", gold, "#14B8A6"),
  "agentic-arena": createTheme("Agentic Arena", gold, "#14B8A6"),
  designx: createTheme("DesignX", silver, "#3B82F6", "#9CA3AF"),

  // Keep the existing generic categories available for older event links.
  coding: createTheme("Coding", gold, "#F2D675"),
  gaming: createTheme("Gaming", gold, "#3B82F6"),
  quiz: createTheme("Quiz", gold, "#F28C28"),
};

export function getEventTheme(slug: string): EventTheme {
  return eventThemes[slug.toLowerCase()] ?? defaultTheme;
}
