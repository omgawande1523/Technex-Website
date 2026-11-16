import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { eventDetails } from "@/constants/event-details";
import { festival, festivalDates, getEvent, siteName } from "@/lib/content";

export const alt = `${festival.name} ${festival.edition} event card`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return eventDetails.map((e) => ({ slug: e.slug }));
}

const GOLD = "#d9ad62";
const PAPER = "#0b0906";
const BONE = "#f4ead6";

/** Share card per event: black and gold, dotted grain. Next 16: params is a Promise. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ev = getEvent(slug);
  // Satori cannot read woff2, so the OG renderer uses the original Barge .otf.
  const barge = await readFile(join(process.cwd(), "src/app/fonts/og/Barge-Black.otf"));
  const name = (ev?.name ?? siteName()).toUpperCase();
  const facts = ev ? [ev.date ?? festivalDates().label, ev.prize && `PRIZE ${ev.prize}`].filter(Boolean).join("  ·  ") : festivalDates().label;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: PAPER,
          backgroundImage: `radial-gradient(circle at 82% 30%, rgba(217,173,98,0.35) 0, rgba(217,173,98,0) 45%), radial-gradient(rgba(217,173,98,0.22) 1.6px, transparent 1.8px)`,
          backgroundSize: "100% 100%, 14px 14px",
          color: BONE,
          fontFamily: "Barge",
          border: `10px solid ${GOLD}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: GOLD, letterSpacing: 4 }}>
          <span>
            {festival.name} {festival.edition} · {festival.theme}
          </span>
          <span>{ev ? `#${ev.number}` : ""}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ev && (
            <span
              style={{
                alignSelf: "flex-start",
                padding: "6px 18px",
                marginBottom: 18,
                border: `3px solid ${GOLD}`,
                color: GOLD,
                fontSize: 28,
                letterSpacing: 4,
              }}
            >
              {ev.category.toUpperCase()}
            </span>
          )}
          <span style={{ fontSize: name.length > 16 ? 104 : 136, lineHeight: 0.9, color: GOLD }}>{name}</span>
          <div style={{ display: "flex", width: 520, height: 18, marginTop: 22, background: GOLD, borderRadius: "40px 6px 60px 4px", opacity: 0.85 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: BONE, letterSpacing: 2 }}>
          <span>{facts}</span>
          <span style={{ color: GOLD }}>
            {festival.hostShort} {festival.city.toUpperCase()}
          </span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Barge", data: barge, style: "normal", weight: 900 }] },
  );
}
