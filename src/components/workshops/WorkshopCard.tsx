"use client";

import Link from "next/link";
import type { Workshop } from "@/types/workshop";

interface WorkshopCardProps {
  workshop: Workshop;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
  const workshopSlug = workshop.slug || workshop.id;
  const detailHref = `/workshops/${encodeURIComponent(workshopSlug)}`;

  return (
    <article className={`workshop-card accent-${workshop.accent}`}>
      <div className="card-art">
        <div className="card-art__wrapper">
          <img
            className="card-art__cover"
            src={workshop.cover}
            alt={workshop.title}
          />
        </div>
        <img
          className="card-art__character"
          src={workshop.character}
          alt={`${workshop.title} feature cutout`}
        />
      </div>
      <div className="workshop-footer">
        <h2 className="workshop-title">{workshop.title}</h2>
        {workshopSlug ? (
          <Link
            href={detailHref}
            className="workshop-action workshop-action--register"
            aria-label={`Register for ${workshop.title}`}
          >
            Register
          </Link>
        ) : (
          <button
            className="workshop-action workshop-action--register"
            type="button"
            disabled
            aria-label={`Register for ${workshop.title}; registration link not set`}
          >
            Register
          </button>
        )}
      </div>
    </article>
  );
}
