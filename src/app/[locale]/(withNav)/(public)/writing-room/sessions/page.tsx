import { listSessionsServer } from "@/services/sessions.service";
import { SessionsListContent } from "@/components/writing-room/SessionsListContent";

export const dynamic = "force-dynamic";

export default async function WritingRoomSessionsPage() {
  const sessions = await listSessionsServer({
    space: "writing_room",
    status: "published",
    limit: 20,
  });
  return <SessionsListContent sessions={sessions} />;
}
