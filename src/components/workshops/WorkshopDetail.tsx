import EventDetail from "@/components/events/EventDetail";
import type { EventItem } from "@/types/event";

interface WorkshopDetailProps {
  event: EventItem;
}

// Workshops reuse the event detail experience (same markup + the gold detail
// styles), but with workshop-appropriate navigation back to the listing.
export default function WorkshopDetail({ event }: WorkshopDetailProps) {
  return (
    <EventDetail
      event={event}
      backHref="/workshops"
      backLabel="← Back to all workshops"
    />
  );
}
