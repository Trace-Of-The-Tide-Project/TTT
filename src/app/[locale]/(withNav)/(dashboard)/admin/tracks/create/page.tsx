import { TrackFormContent } from "@/components/dashboard/admin/tracks/TrackFormContent";

type PageProps = {
  searchParams: Promise<{ language?: string; translation_of?: string }>;
};

export default async function AdminCreateTrackPage({ searchParams }: PageProps) {
  const { language, translation_of } = await searchParams;
  return <TrackFormContent createLanguage={language} translationOf={translation_of} />;
}
