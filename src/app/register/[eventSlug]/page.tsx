import type { Metadata } from "next";

import RegistrationForm from "./registration-form";
import "./registration.css";
import { getEventTheme } from "@/lib/event-themes";

type PageProps = {
  params: Promise<{
    eventSlug: string;
  }>;
};

export const metadata: Metadata = { title: "Register", robots: { index: false, follow: true } };

export default async function RegisterPage({ params }: PageProps) {
  const { eventSlug } = await params;

  // Get the manually configured colour theme for this event.
  const theme = getEventTheme(eventSlug);

  const themeStyle = {
    "--event-accent": theme.accent,
    "--event-accent-secondary": theme.accentSecondary,
    "--event-accent-tertiary": theme.accentTertiary,
    "--event-accent-soft": theme.accentSoft,
    "--event-accent-border": theme.accentBorder,
  } as React.CSSProperties;

  return (
    <main
      className="registration-page"
      style={themeStyle}
    >
      {/* Full comic artwork */}
      <div className="registration-background" />

      {/* Subtle contrast layer */}
      <div className="registration-overlay" />

      {/* Edge vignette */}
      <div className="registration-vignette" />

     <div className="relative z-10 mx-auto w-full max-w-7xl">

        <header className="registration-header mb-12 text-center">
          <div className="registration-eyebrow">
            TECHNEX <span>2026</span>
          </div>

          <h1>
            ENTER THE
            <br />
            <span>EXPERIENCE.</span>
          </h1>

          <div className="registration-divider" />

          <p>
            Your next chapter begins here. Secure your place.
          </p>
        </header>

        <RegistrationForm eventSlug={eventSlug} />

        <footer className="registration-footer">
          TECHNEX 2026 <span>·</span> REGISTER. INNOVATE. CREATE.
        </footer>

      </div>
    </main>
  );
}
