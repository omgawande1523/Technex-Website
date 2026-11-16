"use client";

import { homeScenes } from "@/lib/content";
import SceneShell from "./SceneShell";
import Hero from "./scenes/Hero";
import Portal from "./scenes/Portal";
import Worlds from "./scenes/Worlds";
import GamerConquest from "./scenes/GamerConquest";
import Overdrive from "./scenes/Overdrive";
import RoboSumo from "./scenes/RoboSumo";
import InkDissolve from "./scenes/InkDissolve";
import Conclave from "./scenes/Conclave";

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
    </main>
  );
}
