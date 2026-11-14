import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { MediaItem } from "@/lib/types";

const IMAGE_RE = /\.(webp|jpe?g|png|gif|avif)$/i;

export async function listMedia(): Promise<MediaItem[]> {
  const possibleDirs = [
    { dir: path.join(process.cwd(), "public", "assets", "gallery"), prefix: "/assets/gallery" },
  ];

  for (const { dir, prefix } of possibleDirs) {
    try {
      const files = (await fs.readdir(dir))
        .filter((file) => IMAGE_RE.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (files.length > 0) {
        return files.map((file, index) => ({
          src: `${prefix}/${file}`,
          title: `FRAME ${String(index + 1).padStart(2, "0")}`,
        }));
      }
    } catch {
      // directory does not exist or unreadable, check next
    }
  }

  return [];
}
