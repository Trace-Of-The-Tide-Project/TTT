import { notFound } from "next/navigation";
import { EncounterDetailContent } from "@/components/open-encounters/EncounterDetailContent";
import { getEncounterServer } from "@/services/encounters.service";

export const dynamic = "force-dynamic";

export default async function EncounterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const encounter = await getEncounterServer(id);
  if (!encounter) notFound();
  return <EncounterDetailContent encounter={encounter} />;
}
