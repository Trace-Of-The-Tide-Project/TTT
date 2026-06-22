import { PersonFormContent } from "@/components/dashboard/admin/people";

type PageProps = {
  params: Promise<{ personId: string }>;
};

export default async function AdminEditPersonPage({ params }: PageProps) {
  const { personId } = await params;
  return <PersonFormContent key={personId} personId={personId} />;
}
