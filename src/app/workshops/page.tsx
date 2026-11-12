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
