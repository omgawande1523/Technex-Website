import type { MetadataRoute } from "next";
import { accommodationEnabled, allEvents, allWorkshops, siteUrl } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  const pages = [
    { path: "/", priority: 1 },
    { path: "/events", priority: 0.9 },
    { path: "/workshops", priority: 0.8 },
    { path: "/passes", priority: 0.8 },
    { path: "/map", priority: 0.5 },
    { path: "/gallery", priority: 0.5 },
    { path: "/sponsors", priority: 0.5 },
    { path: "/team", priority: 0.4 },
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/certificates", priority: 0.3 },
    ...(accommodationEnabled ? [{ path: "/accommodation", priority: 0.4 }] : []),
  ];

  return [
    ...pages.map((p) => ({ url: `${base}${p.path}`, lastModified: now, changeFrequency: "weekly" as const, priority: p.priority })),
    ...allEvents().map((e) => ({
      url: `${base}${e.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: [`${base}${e.href}/opengraph-image`],
    })),
    ...allWorkshops().map((w) => ({ url: `${base}${w.href}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
