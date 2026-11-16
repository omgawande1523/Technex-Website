import type { Metadata } from "next";

// The confirmation page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Registration",
  robots: { index: false, follow: false },
};

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
