import { notFound } from "next/navigation";
import { getSessionServer } from "@/services/sessions.service";
import { SalonSessionDetailContent } from "@/components/waqamh/SalonSessionDetailContent";

export const dynamic = "force-dynamic";

export default async function WaqamhSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionServer(id);
  if (!session || session.space !== "waqamh") notFound();
  return <SalonSessionDetailContent session={session} />;
}
