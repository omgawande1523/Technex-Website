import type { Metadata } from "next";
import CampusMap from "@/components/routes/CampusMap";
import styles from "@/components/routes/routes.module.css";
import { coordinatesLabel, festival, placedEvents, siteName, unplacedEvents } from "@/lib/content";

export const metadata: Metadata = {
  title: "Campus Map",
  description: `Find ${siteName()} events on the ${festival.hostShort} campus, ${festival.city}.`,
  alternates: { canonical: "/map" },
};

export default function MapPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {festival.hostShort} · {coordinatesLabel()}
        </p>
        <h1 className={styles.title}>Campus map</h1>
        <p className={styles.lede}>{festival.address}</p>
        <CampusMap
          placed={placedEvents()}
          unplaced={unplacedEvents()}
          venue={{
            name: festival.hostShort,
            address: festival.address,
            mapUrl: festival.mapUrl,
            coordinates: coordinatesLabel(),
          }}
        />
      </div>
    </main>
  );
}
