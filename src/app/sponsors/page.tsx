import type { Metadata } from "next";
import SponsorsPage from "@/components/sponsors/SponsorsPage";
import styles from "@/components/sponsors/sponsors.module.css";
import { siteName, sponsorsContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sponsors",
  description: `${siteName()} is supported by ${sponsorsContent().title.name} and partners.`,
  alternates: { canonical: "/sponsors" },
};

export default function SponsorsRoute() {
  return (
    <main className={styles.route}>
      <SponsorsPage />
    </main>
  );
}
