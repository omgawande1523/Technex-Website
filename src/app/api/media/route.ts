import { NextResponse } from "next/server";

import { listMedia } from "@/lib/gallery/media";

export const runtime = "nodejs";

export async function GET() {
  const media = await listMedia();
  return NextResponse.json(media);
}
