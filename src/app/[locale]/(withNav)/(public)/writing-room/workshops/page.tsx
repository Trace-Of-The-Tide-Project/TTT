import { WorkshopsContent } from "@/components/workshops/WorkshopsContent";
import { listWorkshopsServer } from "@/services/workshops.service";

export const dynamic = "force-dynamic";

export default async function WorkshopsPage() {
  const workshops = await listWorkshopsServer({ limit: 20 });
  return <WorkshopsContent workshops={workshops} />;
}
