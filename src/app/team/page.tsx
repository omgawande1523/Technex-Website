import type { Metadata } from "next";
import TeamPage from "@/components/team/TeamPage";

export const metadata: Metadata = {
  title: "Team | TECHNEX 2026",
  description: "Meet the organizers, mentors, and developers behind TECHNEX 2026 at SVPCET.",
};

export default function Page() {
  return <TeamPage />;
}
