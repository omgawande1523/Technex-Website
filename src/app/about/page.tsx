import AboutSection from "@/components/about/AboutSection";
import styles from "@/components/about/about.module.css";

export default function AboutPage() {
  return (
    <main className={`${styles.aboutPage} ${styles.standalone}`}>
      <AboutSection />
    </main>
  );
}
