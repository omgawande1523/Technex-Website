
"use client";

import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Workshop } from "@/types/workshop";
import CardFrame from "./CardFrame";
import styles from "./workshops.module.css";

interface WorkshopCardProps {
  workshop: Workshop;
}

export default function WorkshopCard({
  workshop,
}: WorkshopCardProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);

  // Keep the existing card flip animation.
  const flipCard = () => {
    setIsFlipped((flipped) => !flipped);
  };

  // Prevent button clicks from flipping the card.
  const stopAndRun =
    (action: () => void) =>
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      action();
    };

  // Open the corresponding Workshop Details page.
  const handleExplore = () => {
    const slug = encodeURIComponent(String(workshop.id));
    router.push(`/workshops/${slug}`);
  };

  // Open the corresponding Workshop Registration page.
  const handleRegister = () => {
    const slug = encodeURIComponent(String(workshop.id));
    router.push(`/workshops/${slug}/register`);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipCard();
    }
  };

  const titleParts = workshop.title.split(" ");
  const titleLead = titleParts.slice(0, -1).join(" ");
  const titleLast = titleParts.at(-1);

  return (
    <div
      className={styles.cardPerspective}
      role="group"
      tabIndex={0}
      aria-label={`${workshop.title}. Press Enter or Space to flip the card.`}
      onClick={flipCard}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`${styles.cardFlip} ${
          isFlipped ? styles.flipped : ""
        }`}
      >
        {/* FRONT SIDE */}
        <div className={styles.cardFace}>
          <CardFrame>
            <div className={styles.frontContent}>
              <div className={styles.poster}>
                <Image
                  src={workshop.image}
                  alt={`${workshop.title} illustration`}
                  fill
                  sizes="(max-width: 640px) 220px, 22vw"
                />

                <div className={styles.posterShade} />

                <span className={styles.posterCaption}>
                  ARTIFACT // SCHEMATIC
                </span>
              </div>

              <div className={styles.workshopInfo}>
                <div className={styles.workshopIntro}>
                  {workshop.category && (
                    <span className={styles.category}>
                      <span
                        className={styles.categoryDot}
                      />
                      {workshop.category}
                    </span>
                  )}

                  <h2 className={styles.workshopTitle}>
                    {titleLead && (
                      <span>{titleLead}</span>
                    )}

                    <span
                      className={styles.titleHighlight}
                    >
                      {titleLast}
                    </span>
                  </h2>

                  <p className={styles.description}>
                    {workshop.description}
                  </p>
                </div>

                <div className={styles.actions}>
                  {/* EXPLORE BUTTON */}
                  <button
                    className={styles.exploreButton}
                    type="button"
                    onClick={stopAndRun(handleExplore)}
                    aria-label={`Explore ${workshop.title}`}
                  >
                    EXPLORE
                  </button>

                  {/* REGISTER BUTTON */}
                  <button
                    className={styles.registerButton}
                    type="button"
                    onClick={stopAndRun(handleRegister)}
                    aria-label={`Register for ${workshop.title}`}
                  >
                    REGISTER
                  </button>
                </div>
              </div>
            </div>
          </CardFrame>
        </div>

        {/* BACK SIDE */}
        <div
          className={`${styles.cardFace} ${styles.cardBack}`}
        >
          <CardFrame isBack>
            <div className={styles.backContent}>
              <h2 className={styles.backTitle}>
                {workshop.title}
              </h2>

              <p className={styles.backDescription}>
                {workshop.description}
              </p>

              <span className={styles.returnHint}>
                <span aria-hidden="true">⟳</span>
                {" "}CLICK TO RETURN
              </span>
            </div>
          </CardFrame>
        </div>
      </div>
    </div>
  );
}
