import type { Metadata } from "next";
import CertificateLookup from "@/components/routes/CertificateLookup";
import styles from "@/components/routes/routes.module.css";
import { festival, siteName } from "@/lib/content";

export const metadata: Metadata = {
  title: "Certificates",
  description: `Look up and download your ${siteName()} participation and winner certificates.`,
  alternates: { canonical: "/certificates" },
};

export default function CertificatesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{siteName()}</p>
        <h1 className={styles.title}>Certificates</h1>
        <p className={styles.lede}>Find your certificates with the email you registered with, or your registration ID.</p>
        <section className={styles.section}>
          <CertificateLookup contactEmail={festival.email} />
        </section>
      </div>
    </main>
  );
}
