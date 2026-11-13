import { notFound } from "next/navigation";
import WorkshopDetail from "@/components/workshops/WorkshopDetail";
import { getWorkshopDetail } from "@/constants/workshop-details";
import "./workshop-details.css";

type PageProps = {
  params: Promise<{ workshopSlug: string }>;
};

export default async function WorkshopDetailPage({ params }: PageProps) {
  const { workshopSlug } = await params;
  const workshop = getWorkshopDetail(workshopSlug);
  if (!workshop) notFound();

  return (
    <div
      className={`hack-detail-root${workshop.slug === "hackathon" ? " hackathon-workshop" : ""}`}
    >
      <WorkshopDetail event={workshop} />
    </div>
  );
}
