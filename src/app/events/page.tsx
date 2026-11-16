import type { Metadata } from "next";
import { TechnexParticleCanvas } from "@/components/events/TechnexParticleCanvas";
import EventFinder, { type FinderEvent } from "@/components/events/EventFinder";
import {
  allEvents,
  eventCategories,
  eventJsonLd,
  festival,
  festivalDates,
  festivalDayLabel,
  festivalDays,
  jsonLdString,
  siteName,
  siteUrl,
  teamSizeBucket,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Events",
  description: `${allEvents().length} competitions at ${siteName()}: ${eventCategories().join(", ")}. ${festivalDates().label}, ${festival.hostShort} ${festival.city}.`,
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  const events = allEvents();
  const rows: FinderEvent[] = events.map((e) => ({
    slug: e.slug,
    number: e.number,
    name: e.name,
    category: e.category,
    searchText: [e.name, e.category, e.tagline, ...e.domains].join(" ").toLowerCase(),
    image: e.image,
    panel: e.panel,
    href: e.href,
    meta: [e.date, e.teamSize, e.prize].filter(Boolean).join(" · "),
    days: e.extras.days,
    team: teamSizeBucket(e.teamSize),
  }));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteName()} events`,
    url: `${siteUrl()}/events`,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({ "@type": "ListItem", position: i + 1, item: eventJsonLd(e) })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(itemList) }} />
      <TechnexParticleCanvas />
      <EventFinder
        events={rows}
        categories={eventCategories()}
        days={festivalDays().map((day) => ({ day, label: festivalDayLabel(day) }))}
      />
    </>
  );
}
