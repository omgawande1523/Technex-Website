import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkshopDetail from "@/components/workshops/WorkshopDetail";
import { getWorkshopDetail } from "@/constants/workshop-details";
import { allWorkshops, siteName } from "@/lib/content";
import "./workshop-details.css";

type PageProps = {
  params: Promise<{ workshopSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { workshopSlug } = await params;
  const w = allWorkshops().find((x) => x.slug === workshopSlug);
  if (!w) return {};
  return {
    title: w.title,
    description: w.description || `${w.title} at ${siteName()}.`,
    alternates: { canonical: w.href },
    openGraph: { images: [{ url: w.cover }] },
  };
}

export default async function WorkshopDetailPage({ params }: PageProps) {
  const { workshopSlug } = await params;
  const workshop = getWorkshopDetail(workshopSlug);
  if (!workshop) notFound();

  return (
    <div className="hack-detail-root">
      <WorkshopDetail event={workshop} />
    </div>
  );
}
