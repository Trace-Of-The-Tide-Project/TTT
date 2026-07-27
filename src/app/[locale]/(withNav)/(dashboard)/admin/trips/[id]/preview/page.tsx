import { TripPreviewPageContent } from "@/components/dashboard/admin/trips/TripPreviewPageContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminTripPreviewPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="my-4 mx-4 sm:mx-10">
      <TripPreviewPageContent tripId={id} />
    </div>
  );
}
