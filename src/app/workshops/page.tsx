
import type { Metadata } from "next";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import { workshops } from "@/constants/workshops";
import "./workshops.css";

export const metadata: Metadata = {
  title: "Workshops | TECHNEX",
  description: "Explore the hands-on workshops at TECHNEX.",
};

export default function WorkshopsPage() {
  return (
    <main className={styles.page}>
      <div
        className={styles.backgroundGlow}
        aria-hidden="true"
      />

      <header className={styles.header}>
        <h1>WORKSHOPS</h1>
        <div className={styles.titleRule} />
      </header>

      <section
        className={styles.grid}
        aria-label="Available workshops"
      >
        {workshops.map((workshop) => (
          <WorkshopCard
            key={workshop.id}
            workshop={workshop}
          />
        ))}
      </section>
    </main>
  );
}
