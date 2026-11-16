import React from "react";
import type { Metadata } from "next";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
  description:
    "Get in touch with the Technex SVPCET team. Inquiries for event registrations, workshops, corporate sponsorships, and campus access.",
};

export default function Page() {
  return <ContactPage />;
}
