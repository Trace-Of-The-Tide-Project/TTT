import { notFound } from "next/navigation";
import { TripDetailContent } from "@/components/trip/TripDetailContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TripByIdPage({ params }: PageProps) {
  const { id } = await params;
  if (!id?.trim()) notFound();

  return <TripDetailContent key={id} tripId={id} />;
}
