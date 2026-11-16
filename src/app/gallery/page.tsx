import type { Metadata } from "next";
import GalleryScene from "@/components/gallery/GalleryScene";
import { festival } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Moments from past editions of ${festival.name} at ${festival.hostShort}, ${festival.city}.`,
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return <GalleryScene />;
}
