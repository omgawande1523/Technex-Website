import EventDetail from "@/components/events/EventDetail";
import type { EventItem } from "@/types/event";

interface WorkshopDetailProps {
  event: EventItem;
}

export default function WorkshopDetail({ event }: WorkshopDetailProps) {
  return (
    <EventDetail
      event={event}
      backHref="/workshops"
      backLabel="← Back to workshops"
    />
  );
}