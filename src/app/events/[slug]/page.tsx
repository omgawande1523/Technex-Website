import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetail from "@/components/events/EventDetail";
import { eventDetails, getEventDetail } from "@/constants/event-details";
import { eventJsonLd, getEvent, jsonLdString, siteName } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return eventDetails.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = getEvent(slug);
  if (!ev) return {};
  const description = [ev.tagline, ev.date, ev.prize && `Prize pool ${ev.prize}`].filter(Boolean).join(" · ");
  return {
    title: ev.name,
    description: description || `${ev.name} — ${ev.category} at ${siteName()}.`,
    alternates: { canonical: ev.href },
    openGraph: { type: "website", title: `${ev.name} · ${siteName()}`, description, url: ev.href },
    // og:image comes from ./opengraph-image.tsx
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventDetail(slug);
  const summary = getEvent(slug);

  if (!event || !summary) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(eventJsonLd(summary)) }} />
      <EventDetail event={event} />
    </>
  );
}
