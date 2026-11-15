/**
 * Festival-level facts. Values were collected from existing pages
 * (ContactPage, RightSidebar, the old home logo alt text, event-details).
 * Anything not stated in the repo is marked `TODO: confirm value`.
 */

export interface SocialLink {
  name: string;
  href: string;
  kind: "instagram" | "youtube" | "linkedin" | "facebook" | "website";
}

export const festival = {
  name: "TECHNEX",
  edition: "26-27",
  /** Short HUD label for the hero scene. */
  shortName: "TECHNEX 26",
  theme: "INKARNATE",
  /** From the logo alt text on the previous home page. */
  tagline: "Imagination turning into reality.",
  host: "St. Vincent Pallotti College of Engineering and Technology",
  hostShort: "SVPCET",
  city: "Nagpur",
  /**
   * TODO: confirm value. Most event pages say 19–20 Dec 2026, but
   * siteConfig.dates (events.ts) and Coastal Clash say 18–19 Dec.
   * Times are not stated anywhere; 09:00 IST is a placeholder for the countdown.
   */
  startsAt: "2026-12-19T09:00:00+05:30",
  endsAt: "2026-12-20T18:00:00+05:30",
  address: "Gavsi Manapur, Wardha Road, Nagpur – 441108, Maharashtra, India.",
  /**
   * TODO: confirm value. Read from the place pin of mapUrl below
   * (resolved Google Maps link already used on /contact).
   */
  coordinates: { lat: 21.0046708, lng: 79.0477332 },
  mapUrl: "https://maps.app.goo.gl/45tcBrvjHRctXK5e9",
  email: "technex@stvincentngp.edu.in",
  phone: "+91 77578 72997",
  phoneHref: "tel:+917757872997",
  socials: [
    { name: "Instagram", href: "https://www.instagram.com/technex_svpcet_nagpur/?hl=en", kind: "instagram" },
    { name: "YouTube", href: "https://youtu.be/bCcJIvfuiRc?si=bYSNiLfIxK33WN9e", kind: "youtube" },
    { name: "LinkedIn", href: "https://www.linkedin.com/school/svpcet/posts/?feedView=all", kind: "linkedin" },
    { name: "Facebook", href: "https://www.facebook.com/technexsvpcetnagpur/", kind: "facebook" },
    { name: "SVPCET", href: "https://www.stvincentngp.edu.in/", kind: "website" },
  ] satisfies SocialLink[],
} as const;
