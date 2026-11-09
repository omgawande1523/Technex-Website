import type { Workshop } from "@/types/workshop";

export const workshops: Workshop[] = [
  {
    id: "hackathon",
    title: "Hackathon Workshop",
    category: "SOFTWARE & DEV",
    description:
      "Build next-gen applications with modern tech and smart frameworks.",
    image: "/assets/workshops/hackathon-laptop.png",
  },
  {
    id: "gameathon",
    title: "Gameathon Workshop",
    category: "GAME DESIGN",
    description:
      "Learn the basics of game design, coding, and creating your own playable project.",
    image: "/assets/workshops/gameathon-vr.png",
  },
  {
    id: "envision",
    title: "Envision Workshop",
    category: "DATA & ANALYTICS",
    description:
      "Explore data collection, preprocessing, and visualization in a hands-on session.",
    image: "/assets/workshops/envision-arm.png",
  },
  {
    id: "designx",
    title: "DesignX Workshop",
    category: "DIGITAL DESIGN",
    description:
      "Discover digital design practices for creating efficient infrastructure models.",
    image: "/assets/workshops/designx-starship.png",
  },
  {
    id: "coastal-clash",
    title: "Coastal Clash Workshop",
    category: "ROBOTICS & RC",
    description:
      "Learn the engineering behind stable, high-speed RC boats.",
    image: "/assets/workshops/coastal-clash-boat.png",
  },
  {
    id: "mind2market",
    title: "Mind2Market Workshop",
    category: "COMPETITIVE CODING",
    description:
      "Solve challenging coding problems and compete with the best programmers.",
    image: "/assets/workshops/mind2market-rover.png",
  },
];
