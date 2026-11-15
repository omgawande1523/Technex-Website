"use client";

import Link from "next/link";
import type { Workshop } from "@/types/workshop";
import { WorkshopHoloCard } from "./WorkshopHoloCard";

interface WorkshopCardProps {
  workshop: Workshop;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
  const workshopSlug = workshop.slug || workshop.id;
  const detailHref = `/workshops/${encodeURIComponent(workshopSlug)}`;

  return (
    <article className={`workshop-card accent-${workshop.accent}`}>
      <div className="shader-frame">
        <WorkshopHoloCard workshop={workshop} />
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
