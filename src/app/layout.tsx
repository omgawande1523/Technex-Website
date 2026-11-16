import type { Metadata } from "next";
import SiteChrome from "@/components/navigation/SiteChrome";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { bodyFont, displayFont } from "@/app/fonts";
import { festival, siteDescription, siteName, siteUrl } from "@/lib/content";
import "./globals.css";
import "@/components/technex-ai/technex-chatbot.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${siteName()} · ${festival.theme}`, template: `%s · ${siteName()}` },
  description: siteDescription(),
  applicationName: siteName(),
  openGraph: {
    type: "website",
    siteName: siteName(),
    locale: "en_IN",
    title: `${siteName()} · ${festival.theme}`,
    description: siteDescription(),
  },
  twitter: { card: "summary_large_image" },
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
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <SiteChrome />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
