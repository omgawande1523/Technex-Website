import WorkshopRegistrationForm from "./workshop-registration-form";
import "@/app/register/[eventSlug]/registration.css";

type PageProps = {
  params: Promise<{
    workshopSlug: string;
  }>;
};

export default async function WorkshopRegisterPage({
  params,
}: PageProps) {
  const { workshopSlug } = await params;

  return (
    <main
      className="registration-page"
      style={
        {
          "--event-accent": "#e7a83e",
          "--event-accent-soft": "rgba(231, 168, 62, 0.12)",
          "--event-accent-border": "rgba(231, 168, 62, 0.35)",
        } as React.CSSProperties
      }
    >
      <div className="registration-background" />
      <div className="registration-overlay" />
      <div className="registration-vignette" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <header className="registration-header mb-12 text-center">
          <div className="registration-eyebrow">
            TECHNEX <span>2026</span>
          </div>

          <h1 >
            ENTER THE
            <br />
            <span>EXPERIENCE.</span>
          </h1>

          <div className="registration-divider" />

          <p>Your next chapter begins here. Secure your place.</p>
        </header>

        <WorkshopRegistrationForm workshopSlug={workshopSlug} />

        <footer className="registration-footer">
          TECHNEX 2026 <span>·</span> REGISTER. INNOVATE. CREATE.
        </footer>
      </div>
    </main>
  );
}