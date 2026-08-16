import { getTracks } from "@/services/tracks.service";
import { TracksIndexContent } from "@/components/tracks/TracksIndexContent";

export const dynamic = "force-dynamic";

export default async function TracksIndexPage() {
  const tracks = await getTracks({ limit: 100 });
  return <TracksIndexContent tracks={tracks} />;
}
