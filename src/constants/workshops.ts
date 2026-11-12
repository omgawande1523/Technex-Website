import type { Workshop } from "@/types/workshop";

export const workshops: Workshop[] = [
  {
    id: "hackathon",
    slug: "hackathon",
    title: "Hackathon Workshop",
    category: "SOFTWARE & DEV",
    description:
      "Build next-gen applications with modern tech and smart frameworks.",
    cover: "/assets/workshops/hackathon_cover.webp",
    character: "/assets/workshops/hackathon_avatar1.webp",
    accent: "violet",
  },
  {
    id: "coastal-clash",
    slug: "coastal-clash",
    title: "Coastal Clash Workshop",
    category: "RC BOAT DESIGN",
    description:
      "Learn the engineering behind stable, high-speed RC boats.",
    cover: "/assets/workshops/coastal_cover.webp",
    character: "/assets/workshops/coastal_avatar.webp",
    accent: "blue",
  },
  {
    id: "envision",
    slug: "envision",
    title: "Envision Workshop",
    category: "DATA & ANALYTICS",
    description:
      "Explore data collection, preprocessing, and visualization in a hands-on session.",
    cover: "/assets/workshops/envision_cover.webp",
    character: "/assets/workshops/envision_avatar.webp",
    accent: "green",
  },
  {
    id: "designx",
    slug: "designx",
    title: "DesignX Workshop",
    category: "DIGITAL DESIGN",
    description:
      "Discover digital design practices for creating efficient infrastructure models.",
    cover: "/assets/workshops/designx_cover.webp",
    character: "/assets/workshops/designx_avatar.webp",
    accent: "blue",
  },

  {
    id: "apex-ctf",
    slug: "apex-ctf",
    title: "Apex CTF Workshop",
    category: "CYBERSECURITY & HACKING",
    description:
      "Dive into the world of cybersecurity with hands-on Capture The Flag challenges.",
    cover: "/assets/workshops/ctf_cover.webp",
    character: "/assets/workshops/ctf_avatar.webp",
    accent: "red",
  },
 
];
