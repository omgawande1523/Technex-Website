"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ComicModal, { type ComicCardData } from "@/components/landing/ComicModal";
import InkHologramCanvas, { COMIC_CARDS_DATA } from "@/components/landing/InkHologramCanvas";
import UIOverlay from "@/components/landing/UIOverlay";
import StardustLayer from "@/components/landing/StardustLayer";
import styles from "./landing.module.css";

type EntityForm = "humanoid" | "flying_machine" | "watercraft" | "neural_network";

export default function Home() {
  const [selectedComic, setSelectedComic] = useState<ComicCardData | null>(null);
  const [entityForm, setEntityForm] = useState<EntityForm>("humanoid");

  useEffect(() => {
    const onOpen = (ev: Event) => {
      const customEv = ev as CustomEvent<ComicCardData>;
      if (customEv.detail) {
        setSelectedComic(customEv.detail);
      } else if (COMIC_CARDS_DATA && COMIC_CARDS_DATA.length > 0) {
        setSelectedComic(COMIC_CARDS_DATA[0]);
      }
    };
    window.addEventListener("open-comic-modal", onOpen);
    return () => window.removeEventListener("open-comic-modal", onOpen);
  }, []);

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
        <div className={styles.heroBackground} aria-hidden="true" />
        <StardustLayer />

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
          <InkHologramCanvas
            onSelectComic={setSelectedComic}
            bloomStrength={0.34}
            glowIntensity={0.6}
            theme="prime"
            poseMode="hover"
            showHalo={false}
            showCape={false}
            showRibbons={false}
            showCards={false}
            showParticles={false}
            cameraPreset="prime"
            panelLayout="circular"
            modelSource="male_body"
            hologramSkinOpacity={0}
            hologramNetworkIntensity={0}
            hologramNodesBrightness={0}
            hologramFlowSpeed={1}
            hologramChestCoreRadiance={0}
            showHologramAura={false}
            showHologramScanline={false}
            entityForm={entityForm}
            onEntityFormChange={setEntityForm}
            autoTransform
          />
        </div>

        <div className={styles.heroScrim} aria-hidden="true" />

        {/* Hero content slot: left side on desktop, top on mobile.
            Add the logo, countdown timer and Register Now button here. */}
        <div className={styles.heroContent}>
          <Image
            src="/tnx_logo_trimmed.webp"
            alt="TECHNEX 2026 — 19th to 20th December 2026, St. Vincent Pallotti College of Engineering and Technology, Nagpur. Imagination turning into reality."
            width={465}
            height={256}
            priority
            className={styles.heroLogo}
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
