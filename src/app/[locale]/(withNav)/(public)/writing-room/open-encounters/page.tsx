import { OpenEncountersContent } from "@/components/open-encounters/OpenEncountersContent";
import { listEncountersServer } from "@/services/encounters.service";

export const dynamic = "force-dynamic";

export default async function OpenEncountersPage() {
  const events = await listEncountersServer({ limit: 20 });
  return <OpenEncountersContent events={events} />;
}
