import { EncounterFormContent } from "@/components/dashboard/admin/encounters/EncounterFormContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditEncounterPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="my-4 mx-10">
      <EncounterFormContent encounterId={id} />
    </div>
  );
}