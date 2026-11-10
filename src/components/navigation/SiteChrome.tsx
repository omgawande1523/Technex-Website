"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import LeftSidebar from "@/components/landing/LeftSidebar";
import RightSidebar from "@/components/landing/RightSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

export default function SiteChrome() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <>
      <Navbar />
      <LeftSidebar />
      <RightSidebar />
      <MobileBottomNav />
    </>
  );
}
