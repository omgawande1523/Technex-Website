import type { Metadata } from "next";
import SiteChrome from "@/components/navigation/SiteChrome";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { gateScript } from "@/components/chrome/gateScript";
import { bodyFont, displayFont } from "@/app/fonts";
import "./globals.css";
import "@/components/technex-ai/technex-chatbot.css";

export const metadata: Metadata = {
  title: "TECHNEX 2026",
  description:
    "Explore the TECHNEX 2026 multiverse innovation experience at SVPCET Nagpur.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
      { url: "/logo_topnav_black_bg.png", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before paint: hides the Enter gate for returning visitors. */}
        <script dangerouslySetInnerHTML={{ __html: gateScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <SiteChrome />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
