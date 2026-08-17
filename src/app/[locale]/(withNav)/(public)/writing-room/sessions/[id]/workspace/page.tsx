import { notFound } from "next/navigation";
import { getSessionServer } from "@/services/sessions.service";
import { SessionWorkspaceContent } from "@/components/writing-room/SessionWorkspaceContent";

export const dynamic = "force-dynamic";

export default async function SessionWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionServer(id);
  if (!session) notFound();
  return <SessionWorkspaceContent session={session} />;
}
