import { listSessionsServer } from "@/services/sessions.service";
import { SalonLandingContent } from "@/components/waqamh/SalonLandingContent";

export const dynamic = "force-dynamic";

export default async function WaqamhLandingPage() {
  const sessions = await listSessionsServer({ space: "waqamh", status: "published", limit: 40 });
  return <SalonLandingContent sessions={sessions} />;
}
