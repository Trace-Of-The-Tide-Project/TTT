import { notFound } from "next/navigation";
import { getSessionServer } from "@/services/sessions.service";
import { SessionDetailContent } from "@/components/writing-room/SessionDetailContent";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionServer(id);
  if (!session) notFound();
  return <SessionDetailContent session={session} />;
}
