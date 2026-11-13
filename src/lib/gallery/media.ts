import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { MediaItem } from "@/lib/types";

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");
const IMAGE_RE = /\.(webp|jpe?g|png|gif|avif)$/i;

export async function listMedia(): Promise<MediaItem[]> {
  const files = (await fs.readdir(GALLERY_DIR))
    .filter((file) => IMAGE_RE.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return files.map((file, index) => ({
    src: `/gallery/${file}`,
    title: `FRAME ${String(index + 1).padStart(2, "0")}`,
  }));
}
