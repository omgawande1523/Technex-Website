import type { Metadata } from "next";
import AboutSection from "@/components/about/AboutSection";
import styles from "@/components/about/about.module.css";
import { festival, siteName } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteName()}, the annual technical festival of ${festival.host}, ${festival.city}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className={`${styles.aboutPage} ${styles.standalone}`}>
      <AboutSection />
    </main>
  );
}
