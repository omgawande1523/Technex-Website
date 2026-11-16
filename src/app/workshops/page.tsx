
import type { Metadata } from "next";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import { workshops } from "@/constants/workshops";
import { allWorkshops, siteName } from "@/lib/content";
import "./workshops.css";

export const metadata: Metadata = {
  title: "Workshops",
  description: `Hands-on workshops at ${siteName()}: ${allWorkshops().map((w) => w.title).join(", ")}.`,
  alternates: { canonical: "/workshops" },
};

export default function WorkshopsPage() {
  return (
    <div className="workshop-page-wrapper">
      <main className="page-shell">
        <header className="page-header">
          <h1>Workshops</h1>
        </header>

        <section className="workshop-grid" aria-label="Featured workshops">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id || workshop.cover} workshop={workshop} />
          ))}
        </section>
      </main>
    </div>
  );
}
