"use client";

import { usePathname } from "next/navigation";
import Hud from "@/components/chrome/Hud";
import Preloader from "@/components/chrome/Preloader";
import InkTransition from "@/components/chrome/InkTransition";
import InkCursor from "@/components/chrome/InkCursor";
import TechnexChatbot from "@/components/technex-ai/TechnexChatbot";

/** Shared chrome for every public route. Admin pages render their own shell. */
export default function SiteChrome() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  // The realm home brings its own intro, top bar and cursor.
  if (pathname === "/") {
    return (
      <>
        <InkTransition />
        <TechnexChatbot />
      </>
    );
  }

  return (
    <>
      <Preloader />
      <Hud />
      <InkTransition />
      <InkCursor />
      <TechnexChatbot />
    </>
  );
}
