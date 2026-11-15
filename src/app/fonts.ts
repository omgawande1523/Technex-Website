import localFont from "next/font/local";

/**
 * The two type families of the site, self-hosted as woff2.
 * Barge (display) and Outfit (body, OFL — see ./fonts/OUTFIT-OFL.txt).
 * globals.css aliases every legacy font variable to these two.
 */
export const displayFont = localFont({
  src: [
    { path: "./fonts/Barge-Black.woff2", weight: "900", style: "normal" },
    { path: "./fonts/Barge-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-ink-display",
  display: "swap",
  fallback: ["Arial Black", "Impact", "sans-serif"],
});

export const bodyFont = localFont({
  src: "./fonts/Outfit-Variable-latin.woff2",
  weight: "100 900",
  variable: "--font-ink-body",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});
