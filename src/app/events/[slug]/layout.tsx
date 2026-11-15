import "./event-details.css";

export default function EventDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="hack-detail-root">{children}</div>;
}
