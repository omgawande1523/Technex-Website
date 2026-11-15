import type { Metadata } from "next";
import Link from "next/link";
import LiveFee from "@/components/routes/LiveFee";
import styles from "@/components/routes/routes.module.css";
import { allWorkshops, festival, festivalDates, passes, registrableEvents, siteName, TBA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Passes",
  description: `Register for ${siteName()} events and workshops — ${festivalDates().label}, ${festival.hostShort} ${festival.city}.`,
  alternates: { canonical: "/passes" },
};

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function PassesPage() {
  const tiers = passes();
  const events = registrableEvents();
  const workshops = allWorkshops();

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {siteName()} · {festivalDates().label}
        </p>
        <h1 className={styles.title}>Passes</h1>
        <p className={styles.lede}>
          {tiers.length
            ? "Pick a pass, then complete registration and payment."
            : "Registration is per event and per workshop. Choose one below to open its registration form; payment happens at the end of that form."}
        </p>

        {tiers.length > 0 && (
          <section className={styles.section} aria-labelledby="tiers">
            <h2 id="tiers" className={styles.sectionTitle}>
              Festival passes
            </h2>
            <div className={styles.grid}>
              {tiers.map((t) => (
                <article key={t.id} className={styles.card}>
                  <h3 className={styles.cardTitle}>{t.name}</h3>
                  <p className={styles.meta}>{t.pricePaise === null ? TBA : rupees(t.pricePaise)}</p>
                  <ul className={styles.meta}>
                    {t.perks.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className={styles.cardActions}>
                    <Link href={t.href} className={styles.button}>
                      Get pass
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section} aria-labelledby="event-reg">
          <h2 id="event-reg" className={styles.sectionTitle}>
            Competitions ({events.length})
          </h2>
          <div className={styles.grid}>
            {events.map((ev) => (
              <article key={ev.slug} className={styles.card}>
                <span className={styles.tag}>{ev.category}</span>
                <h3 className={styles.cardTitle}>{ev.name}</h3>
                <p className={styles.meta}>
                  {[ev.date, ev.teamSize].filter(Boolean).join(" · ") || TBA}
                </p>
                <p className={styles.meta}>
                  {ev.registerIsExternal ? "Registration on the organisers' form" : <LiveFee kind="event" slug={ev.slug} />}
                </p>
                <div className={styles.cardActions}>
                  {ev.registerIsExternal ? (
                    <a href={ev.registerHref} className={styles.button} target="_blank" rel="noopener noreferrer">
                      Register ↗
                    </a>
                  ) : (
                    <Link href={ev.registerHref} className={styles.button}>
                      Register
                    </Link>
                  )}
                  <Link href={ev.href} className={styles.ghost}>
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="workshop-reg">
          <h2 id="workshop-reg" className={styles.sectionTitle}>
            Workshops ({workshops.length})
          </h2>
          <div className={styles.grid}>
            {workshops.map((w) => (
              <article key={w.id} className={styles.card}>
                {w.category && <span className={styles.tag}>{w.category}</span>}
                <h3 className={styles.cardTitle}>{w.title}</h3>
                {w.description && <p className={styles.meta}>{w.description}</p>}
                <p className={styles.meta}>
                  <LiveFee kind="workshop" slug={w.slug} />
                </p>
                <div className={styles.cardActions}>
                  <Link href={w.registerHref} className={styles.button}>
                    Register
                  </Link>
                  <Link href={w.href} className={styles.ghost}>
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
