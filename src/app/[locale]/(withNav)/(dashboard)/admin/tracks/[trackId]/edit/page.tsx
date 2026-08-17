import { TrackFormContent } from "@/components/dashboard/admin/tracks/TrackFormContent";

type PageProps = {
  params: Promise<{ trackId: string }>;
};

export default async function AdminEditTrackPage({ params }: PageProps) {
  const { trackId } = await params;
  return <TrackFormContent key={trackId} trackId={trackId} />;
}
