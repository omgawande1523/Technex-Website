"use client";

import { homeScenes } from "@/lib/content";
import SceneShell from "./SceneShell";
import Hero from "./scenes/Hero";

/** The home scroll story: one SceneShell per scene, in homeScenes() order. */
export default function HomeStory() {
  const hud = Object.fromEntries(homeScenes().map((s) => [s.id, s.hud]));
  return (
    <main className="home-story">
      <SceneShell id="hero" hud={hud.hero} eager>
        <Hero />
      </SceneShell>
    </main>
  );
}
