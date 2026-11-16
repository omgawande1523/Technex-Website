import type { Metadata } from "next";
import TeamPage from "@/components/team/TeamPage";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the organizers, mentors, and developers behind TECHNEX at SVPCET.",
  alternates: { canonical: "/team" },
};

export default function Page() {
  return <TeamPage />;
}
