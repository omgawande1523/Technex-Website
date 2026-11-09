import type { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import LeftSidebar from "@/components/landing/LeftSidebar";
import RightSidebar from "@/components/landing/RightSidebar";
import {
  eventDisplayFont,
  eventTextFont,
  landingBodyFont,
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
  title: "TECHNEX 2026 - Official Annual Technical Symposium",
  description:
    "Explore the TECHNEX 2026 multiverse innovation experience at SVPCET Nagpur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${eventDisplayFont.variable} ${eventTextFont.variable} ${landingBodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <LeftSidebar />
        <RightSidebar />
        {children}
      </body>
    </html>
  );
}
