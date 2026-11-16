import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccommodationForm from "@/components/routes/AccommodationForm";
import styles from "@/components/routes/routes.module.css";
import { accommodationEnabled, festival, festivalDates, siteName } from "@/lib/content";

export const metadata: Metadata = {
  title: "Accommodation",
  description: `Request accommodation for ${siteName()} at ${festival.hostShort}, ${festival.city}.`,
};

/** IST calendar date (YYYY-MM-DD) of an ISO timestamp, for the date inputs. */
const istDate = (iso: string) => new Date(Date.parse(iso) + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

export default function AccommodationPage() {
  // Feature flag: NEXT_PUBLIC_FEATURE_ACCOMMODATION=true
  if (!accommodationEnabled) notFound();

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {siteName()} · {festivalDates().label}
        </p>
        <h1 className={styles.title}>Accommodation</h1>
        <p className={styles.lede}>
          Coming from outside {festival.city}? Send a request and the team will get back to you with availability.
        </p>
        <section className={styles.section} aria-labelledby="acc-info">
          <h2 id="acc-info" className={styles.sectionTitle}>
            Details
          </h2>
          {/* TODO: confirm value — no accommodation details (location, tariff, check-in rules) exist in the repo yet. */}
          <p className={styles.notice}>
            Location, tariff and check-in rules: TBA. Questions: <a href={`mailto:${festival.email}`}>{festival.email}</a> ·{" "}
            <a href={festival.phoneHref}>{festival.phone}</a>
          </p>
        </section>
        <section className={styles.section} aria-labelledby="acc-form">
          <h2 id="acc-form" className={styles.sectionTitle}>
            Request a stay
          </h2>
          <AccommodationForm checkIn={istDate(festival.startsAt)} checkOut={istDate(festival.endsAt)} />
        </section>
      </div>
    </main>
  );
}
