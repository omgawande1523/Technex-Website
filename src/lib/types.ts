/** Shared types for gallery media. */

/** One row from the photo API (`GET /api/media`). */
export interface MediaItem {
  src: string;
  title: string;
}

/** Media fed to the gallery engine: local photos or procedural loop patterns. */
export interface GalleryMedia {
  type: "image" | "loop";
  src: string;
  title: string;
}
