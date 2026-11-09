import { notFound } from "next/navigation";
import EventDetail from "@/components/events/EventDetail";
import { eventDetails, getEventDetail } from "@/constants/event-details";

export function generateStaticParams() {
  return eventDetails.map((event) => ({ slug: event.slug }));
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventDetail(slug);

  if (!event) notFound();

  return <EventDetail event={event} />;
}
