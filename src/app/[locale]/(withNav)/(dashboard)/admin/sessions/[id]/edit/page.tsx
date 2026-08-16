import { SessionFormContent } from "@/components/dashboard/admin/sessions/SessionFormContent";
import { SessionAttendancePanel } from "@/components/dashboard/admin/sessions/SessionAttendancePanel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditSessionPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="my-4 mx-4 sm:mx-10 space-y-8">
      <SessionFormContent sessionId={id} />
      <div className="mx-auto max-w-2xl px-4">
        <SessionAttendancePanel sessionId={id} />
      </div>
    </div>
  );
}
