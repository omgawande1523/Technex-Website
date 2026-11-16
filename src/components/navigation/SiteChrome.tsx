"use client";

import { usePathname } from "next/navigation";
import Hud from "@/components/chrome/Hud";
import PageTransition from "@/components/chrome/PageTransition";
import TechnexChatbot from "@/components/technex-ai/TechnexChatbot";

/** Shared chrome for every public route. Admin pages render their own shell. */
export default function SiteChrome() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  // The realm home brings its own intro and top bar.
  if (pathname === "/") {
    return (
      <>
        <PageTransition />
        <TechnexChatbot />
      </>
    );
  }

  return (
    <>
      <Hud />
      <PageTransition />
      <TechnexChatbot />
    </>
  );
}
