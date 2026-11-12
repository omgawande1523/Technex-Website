import React from "react";
import type { Metadata } from "next";
import BackgroundVideo from "@/components/contact/BackgroundVideo";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact Us | Technex SVPCET 2026",
  description:
    "Get in touch with the Technex SVPCET team. Inquiries for event registrations, workshops, corporate sponsorships, and campus access.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-[#d9ad62] selection:text-black technex-contact-page">
      {/* Background Atmosphere, Dynamic Particles & Audio */}
      <BackgroundVideo />

      {/* Da Vinci Parchment Scroll Contact Showcase */}
      <ContactContent />
    </div>
  );
}
