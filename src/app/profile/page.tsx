import type { Metadata } from "next";
import ProfileClient from "@/components/routes/ProfileClient";
import styles from "@/components/routes/routes.module.css";
import { siteName } from "@/lib/content";

export const metadata: Metadata = {
  title: "Profile",
  description: `Your ${siteName()} registrations, payment status and entry passes.`,
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{siteName()}</p>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.lede}>Registrations, payment status and your QR entry passes.</p>
        <ProfileClient />
      </div>
    </main>
  );
}
