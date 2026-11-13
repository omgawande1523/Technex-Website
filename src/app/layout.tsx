import type { Metadata } from "next";
import SiteChrome from "@/components/navigation/SiteChrome";
import {
  eventDisplayFont,
  eventTextFont,
  landingBodyFont,
  metalManiaFont,
} from "@/app/event-fonts";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TECHNEX 2026",
  description:
    "Explore the TECHNEX 2026 multiverse innovation experience at SVPCET Nagpur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${metalManiaFont.variable} ${eventDisplayFont.variable} ${eventTextFont.variable} ${landingBodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome />
        {children}
      </body>
    </html>
  );
}
