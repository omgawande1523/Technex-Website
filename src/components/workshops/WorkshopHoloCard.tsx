"use client";

import React, { useState, useRef, useCallback } from "react";
import type { Workshop } from "@/types/workshop";
import { ElementIcon, ElementalWatermark } from "./ElementIcon";
import styles from "./workshop-holo-card.module.css";

interface WorkshopHoloCardProps {
  workshop: Workshop;
  className?: string;
}

const ACCENT_THEMES: Record<
  string,
  {
    primary: string;
    secondary: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    foilTint: string;
    emberColor: string;
  }
> = {
  violet: {
    primary: "#a855f7",
    secondary: "#c084fc",
    glow: "rgba(168, 85, 247, 0.45)",
    badgeBg: "rgba(168, 85, 247, 0.25)",
    badgeText: "#f3e8ff",
    foilTint: "linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(236, 72, 153, 0.35), rgba(99, 102, 241, 0.35))",
    emberColor: "#c084fc",
  },
  blue: {
    primary: "#0ea5e9",
    secondary: "#38bdf8",
    glow: "rgba(14, 165, 233, 0.45)",
    badgeBg: "rgba(14, 165, 233, 0.25)",
    badgeText: "#e0f2fe",
    foilTint: "linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(59, 130, 246, 0.35), rgba(45, 212, 191, 0.35))",
    emberColor: "#38bdf8",
  },
  green: {
    primary: "#10b981",
    secondary: "#34d399",
    glow: "rgba(16, 185, 129, 0.45)",
    badgeBg: "rgba(16, 185, 129, 0.25)",
    badgeText: "#d1fae5",
    foilTint: "linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(52, 211, 153, 0.35), rgba(234, 179, 8, 0.35))",
    emberColor: "#34d399",
  },
  cyan: {
    primary: "#06b6d4",
    secondary: "#22d3ee",
    glow: "rgba(6, 182, 212, 0.45)",
    badgeBg: "rgba(6, 182, 212, 0.25)",
    badgeText: "#cffafe",
    foilTint: "linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(245, 158, 11, 0.35), rgba(56, 189, 248, 0.35))",
    emberColor: "#22d3ee",
  },
  red: {
    primary: "#ef4444",
    secondary: "#f87171",
    glow: "rgba(239, 68, 68, 0.45)",
    badgeBg: "rgba(239, 68, 68, 0.25)",
    badgeText: "#fee2e2",
    foilTint: "linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(249, 115, 22, 0.35), rgba(220, 38, 38, 0.35))",
    emberColor: "#f87171",
  },
};

export function WorkshopHoloCard({ workshop, className = "" }: WorkshopHoloCardProps) {
  const theme = ACCENT_THEMES[workshop.accent] || ACCENT_THEMES.violet;
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;

    // Subtle 3D tilt: max 11 deg
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -11;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 11;

    // 3D Parallax offset for the floating logo (moves in 3D opposite/parallel to tilt)
    const pxShift = ((x - rect.width / 2) / (rect.width / 2)) * 14;
    const pyShift = ((y - rect.height / 2) / (rect.height / 2)) * 14;

    setRotate({ x: rx, y: ry });
    setGlare({ x: px, y: py, opacity: 0.95 });
    if (cardRef.current) {
      cardRef.current.style.setProperty("--parallax-x", `${pxShift}px`);
      cardRef.current.style.setProperty("--parallax-y", `${pyShift}px`);
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
    if (cardRef.current) {
      cardRef.current.style.setProperty("--parallax-x", `0px`);
      cardRef.current.style.setProperty("--parallax-y", `0px`);
    }
  }, []);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`${styles.cardContainer} ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onDoubleClick={toggleFlip}
      style={
        {
          "--theme-primary": theme.primary,
          "--theme-secondary": theme.secondary,
          "--theme-glow": theme.glow,
          "--theme-badge-bg": theme.badgeBg,
          "--theme-badge-text": theme.badgeText,
          "--theme-foil": theme.foilTint,
          "--theme-ember": theme.emberColor,
          "--rx": `${rotate.x}deg`,
          "--ry": `${rotate.y}deg`,
          "--glare-x": `${glare.x}%`,
          "--glare-y": `${glare.y}%`,
          "--glare-opacity": glare.opacity,
        } as React.CSSProperties
      }
    >
      <div className={`${styles.cardFlipper} ${isFlipped ? styles.isFlipped : ""}`}>
        {/* FRONT FACE */}
        <div className={styles.cardFront}>
          {/* Top Header */}
          <div className={styles.cardHeader}>
            <div className={styles.titleGroup}>
              <span className={styles.stageTag}>✦ TECHNEX &apos;26 ✦</span>
              <h3 className={styles.cardName}>{workshop.title.replace(" Workshop", "")}</h3>
            </div>
            <div className={styles.hpGroup}>
              <span className={styles.hpValue}>
                <small className={styles.hpLabel}>HP</small>
                {workshop.hp || 150}
              </span>
              <div className={styles.elementOrb} title={workshop.element || "TECH"}>
                <ElementIcon type={workshop.element || workshop.accent} size={15} glow />
              </div>
            </div>
          </div>

          {/* Minimalist Animated Art Window */}
          <div className={styles.artFrame}>
            {/* Deep space cosmic backdrop with breathing theme glow */}
            <div className={styles.artBackdrop} />

            {/* Concentric rotating tech reticle */}
            <div className={styles.rotatingReticle} aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" className={styles.reticleSvg}>
                <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
                <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
                <circle cx="100" cy="100" r="54" stroke="currentColor" strokeWidth="1" strokeDasharray="14 4 4 4" opacity="0.4" />
                <path d="M100 4V14M100 186V196M4 100H14M186 100H196" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </div>

            {/* Smooth glowing horizontal laser scanline */}
            <div className={styles.laserScanline} aria-hidden="true" />

            {/* Clean, minimalist hero emblem with smooth floating animation */}
            <div className={styles.heroWrapper}>
              <img
                src={workshop.cover}
                alt={workshop.title}
                className={styles.minimalHeroImage}
                loading="eager"
              />
            </div>

            {/* Futuristic HUD corner accents */}
            <div className={styles.hudCornerTL} aria-hidden="true" />
            <div className={styles.hudCornerTR} aria-hidden="true" />
            <div className={styles.hudCornerBL} aria-hidden="true" />
            <div className={styles.hudCornerBR} aria-hidden="true" />

            {/* In-art holographic foil sheen */}
            <div className={styles.artHoloSheen} />
          </div>

          {/* Subheader info strip */}
          <div className={styles.infoStrip}>
            <span className={styles.infoPill}>
              <ElementIcon type={workshop.element || workshop.accent} size={11} />
              <span>{workshop.element || "CORE"}</span>
            </span>
            <span className={styles.dot}>•</span>
            <span>{workshop.category || "TECHNEX TRACK"}</span>
            <span className={styles.dot}>•</span>
            <span className={styles.levelTag}>LV. 99</span>
          </div>

          {/* Moves / Abilities section with background watermark */}
          <div className={styles.movesSection}>
            <ElementalWatermark
              type={workshop.element || workshop.accent}
              className={styles.elementalWatermark}
            />

            {(workshop.attacks && workshop.attacks.length > 0
              ? workshop.attacks
              : [
                  {
                    name: "System Genesis",
                    cost: [workshop.element || "tech", workshop.element || "tech"],
                    damage: 50,
                    description: workshop.description || "Deploys rapid prototype solutions.",
                  },
                  {
                    name: "Omni Protocol",
                    cost: [workshop.element || "tech", workshop.element || "tech", "tech"],
                    damage: 130,
                    description: "Executes end-to-end mission critical pipeline with zero latency.",
                  },
                ]
            ).map((attack, idx) => (
              <div key={idx} className={styles.moveRow}>
                <div className={styles.moveHeader}>
                  <div className={styles.moveCost}>
                    {(attack.cost || [workshop.element || "tech", workshop.element || "tech"]).map(
                      (costIcon, cIdx) => (
                        <span key={cIdx} className={styles.costBadge}>
                          <ElementIcon type={costIcon} size={12} />
                        </span>
                      )
                    )}
                    <span className={styles.moveName}>{attack.name}</span>
                  </div>
                  <span className={styles.moveDamage}>{attack.damage}</span>
                </div>
                <p className={styles.moveDesc}>{attack.description}</p>
              </div>
            ))}
          </div>

          {/* Bottom Card Footer */}
          <div className={styles.cardBottomMeta}>
            <div className={styles.metaStat}>
              <span className={styles.metaLabel}>weakness</span>
              <span className={styles.metaValueRow}>
                <ElementIcon type="fire" size={11} />
                <span>×2</span>
              </span>
            </div>
            <div className={styles.metaStat}>
              <span className={styles.metaLabel}>resistance</span>
              <span className={styles.metaValueRow}>
                <ElementIcon type="shield" size={11} />
                <span>-30</span>
              </span>
            </div>
            <div className={styles.metaStat}>
              <span className={styles.metaLabel}>archive</span>
              <span className={styles.metaValue}>{workshop.holoNumber || "001 / 005"}</span>
            </div>
          </div>

          {/* Ornate Gold Border & Corner Filigrees */}
          <div className={styles.goldBorderOverlay} />

          {/* Full-Card Holographic Prismatic Foil & Glare Layers */}
          <div className={styles.holoFoilOverlay} />
          <div className={styles.glareHighlight} />
        </div>

        {/* BACK FACE (Revealed on Double Click) */}
        <div className={styles.cardBack}>
          <div className={styles.backBorder}>
            <div className={styles.backCrest}>
              <div className={styles.sigilCircle}>
                <ElementIcon type={workshop.element || workshop.accent} size={30} glow />
              </div>
              <h4 className={styles.backTitle}>{workshop.title}</h4>
              <p className={styles.backCategory}>{workshop.category}</p>
            </div>
            <p className={styles.backDescription}>{workshop.description}</p>
            <div className={styles.backBadge}>Double-click to flip back</div>
          </div>
          <div className={styles.holoFoilOverlay} />
        </div>
      </div>

      {/* Floating Ember Sparkles */}
      <div className={styles.emberContainer} aria-hidden="true">
        <span className={styles.ember1} />
        <span className={styles.ember2} />
        <span className={styles.ember3} />
      </div>
    </div>
  );
}
