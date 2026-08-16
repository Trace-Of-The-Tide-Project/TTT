import { listAudioLibraryServer } from "@/services/sessions.service";
import { AudioLibraryContent } from "@/components/waqamh/AudioLibraryContent";

export const dynamic = "force-dynamic";

export default async function WaqamhAudioLibraryPage() {
  const sessions = await listAudioLibraryServer({ limit: 40 });
  return <AudioLibraryContent sessions={sessions} />;
}
