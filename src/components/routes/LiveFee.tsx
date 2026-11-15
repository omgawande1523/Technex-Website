"use client";

import { useEffect, useState } from "react";
import { getPublishedEvents, getWorkshopRegistrationForm, type PublicEventSummary } from "@/lib/api";

const API_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_API_URL);
const FALLBACK = "Fee shown at checkout";

let eventsPromise: Promise<PublicEventSummary[]> | null = null;
const loadEvents = () => (eventsPromise ??= getPublishedEvents());

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function describe(feeType: PublicEventSummary["feeType"], paise: number) {
  if (feeType === "free" || paise === 0) return "Free";
  return `${rupees(paise)} ${feeType === "per_team" ? "per team" : "per participant"}`;
}

/**
 * Live registration fee from the backend (the same source checkout uses).
 * Without NEXT_PUBLIC_API_URL, or when the item is not published, it says
 * the fee is shown at checkout instead of guessing.
 */
export default function LiveFee({ kind, slug }: { kind: "event" | "workshop"; slug: string }) {
  const [label, setLabel] = useState<string>(API_CONFIGURED ? "Checking fee…" : FALLBACK);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    let active = true;
    const work =
      kind === "event"
        ? loadEvents().then((list) => {
            const ev = list.find((e) => e.slug === slug);
            if (!ev) return FALLBACK;
            const fee = describe(ev.feeType, ev.feeAmountPaise);
            return ev.registrationOpen ? fee : `${fee} · registration closed`;
          })
        : getWorkshopRegistrationForm(slug).then(({ workshop }) =>
            describe("per_participant", workshop.feeAmountPaise) +
            (workshop.canRegister ? "" : " · registration closed"),
          );
    work
      .then((text) => active && setLabel(text))
      .catch(() => active && setLabel(FALLBACK));
    return () => {
      active = false;
    };
  }, [kind, slug]);

  return <span aria-live="polite">{label}</span>;
}
