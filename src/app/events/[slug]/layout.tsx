import { Manrope } from "next/font/google";
import "./event-details.css";

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function EventDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`hack-detail-root ${body.variable}`}>{children}</div>;
}
