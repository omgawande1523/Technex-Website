"use client";

import { homeScenes } from "@/lib/content";
import SceneShell from "./SceneShell";
import dynamic from "next/dynamic";
import Hero from "./scenes/Hero";

// Every scene after the hero is its own chunk, fetched when SceneShell mounts it.
const Portal = dynamic(() => import("./scenes/Portal"));
const Worlds = dynamic(() => import("./scenes/Worlds"));
const GamerConquest = dynamic(() => import("./scenes/GamerConquest"));
const Overdrive = dynamic(() => import("./scenes/Overdrive"));
const RoboSumo = dynamic(() => import("./scenes/RoboSumo"));
const InkDissolve = dynamic(() => import("./scenes/InkDissolve"));
const Conclave = dynamic(() => import("./scenes/Conclave"));
const WorkshopsCanvas = dynamic(() => import("./scenes/WorkshopsCanvas"));
const MemoryLane = dynamic(() => import("./scenes/MemoryLane"));
const Sponsors = dynamic(() => import("./scenes/Sponsors"));
const Finale = dynamic(() => import("./scenes/Finale"));

/** The home scroll story: one SceneShell per scene, in homeScenes() order. */
export default function HomeStory() {
  const hud = Object.fromEntries(homeScenes().map((s) => [s.id, s.hud]));
  return (
    <main className="home-story">
      <SceneShell id="hero" hud={hud.hero} eager>
        <Hero />
      </SceneShell>
      <SceneShell id="portal" hud={hud.portal}>
        <Portal />
      </SceneShell>
      <SceneShell id="worlds" hud={hud.worlds}>
        <Worlds />
      </SceneShell>
      {hud["gamer-conquest"] && (
        <SceneShell id="gamer-conquest" hud={hud["gamer-conquest"]}>
          <GamerConquest />
        </SceneShell>
      )}
      {hud.overdrive && (
        <SceneShell id="overdrive" hud={hud.overdrive}>
          <Overdrive />
        </SceneShell>
      )}
      {hud["robo-sumo"] && (
        <>
          <SceneShell id="robo-sumo" hud={hud["robo-sumo"]}>
            <RoboSumo />
          </SceneShell>
          <SceneShell id="ink-dissolve" hud={hud.conclave}>
            <InkDissolve from={hud["robo-sumo"]} to={hud.conclave} />
          </SceneShell>
        </>
      )}
      <SceneShell id="conclave" hud={hud.conclave}>
        <Conclave />
      </SceneShell>
      <SceneShell id="workshops-canvas" hud={hud["workshops-canvas"]}>
        <WorkshopsCanvas />
      </SceneShell>
      <SceneShell id="memory-lane" hud={hud["memory-lane"]}>
        <MemoryLane />
      </SceneShell>
      <SceneShell id="sponsors" hud={hud.sponsors}>
        <Sponsors />
      </SceneShell>
      <SceneShell id="finale" hud={hud.finale}>
        <Finale />
      </SceneShell>
    </main>
  );
}
