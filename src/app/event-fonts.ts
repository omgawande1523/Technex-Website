import { Jura, Metal_Mania, Michroma, Outfit } from "next/font/google";

export const metalManiaFont = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-metal-mania",
  display: "swap",
});

export const eventDisplayFont = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const eventTextFont = Jura({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});

export const landingBodyFont = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});
