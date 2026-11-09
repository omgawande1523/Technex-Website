import { eventDisplayFont, eventTextFont } from "@/app/event-fonts";
import "./events-experience.css";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${eventDisplayFont.variable} ${eventTextFont.variable}`}>
      {children}
    </div>
  );
}
