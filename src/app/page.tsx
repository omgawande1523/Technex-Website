"use client";

import React, { useState } from "react";
import ComicModal, { type ComicCardData } from "@/components/landing/ComicModal";
import SupermanPrimeCanvas from "@/components/landing/SupermanPrimeCanvas";
import UIOverlay from "@/components/landing/UIOverlay";
import styles from "./landing.module.css";

type EntityForm = "humanoid" | "flying_machine" | "watercraft" | "neural_network";

export default function Home() {
  const [selectedComic, setSelectedComic] = useState<ComicCardData | null>(null);
  const [entityForm, setEntityForm] = useState<EntityForm>("humanoid");

  return (
    <div className={styles.sitePage}>
      <section
        className={styles.landing}
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "auto",
            width: "100vw",
            height: "100vh",
          }}
        >
          <SupermanPrimeCanvas
            onSelectComic={setSelectedComic}
            bloomStrength={0.34}
            glowIntensity={0.9}
            theme="prime"
            poseMode="hover"
            showHalo={false}
            showCape={false}
            showRibbons={false}
            showCards
            showParticles={false}
            cameraPreset="prime"
            panelLayout="circular"
            modelSource="male_body"
            hologramSkinOpacity={0.65}
            hologramNetworkIntensity={0.6}
            hologramNodesBrightness={0.3}
            hologramFlowSpeed={1}
            hologramChestCoreRadiance={1.3}
            showHologramAura={false}
            showHologramScanline
            entityForm={entityForm}
            onEntityFormChange={setEntityForm}
            autoTransform
          />
        </div>

        <UIOverlay />
        <ComicModal
          card={selectedComic}
          onClose={() => setSelectedComic(null)}
        />
      </section>
    </div>
  );
}
