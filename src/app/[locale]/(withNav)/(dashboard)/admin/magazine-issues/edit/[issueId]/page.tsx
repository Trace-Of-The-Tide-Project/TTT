import { IssueEditor } from "@/components/dashboard/admin/magazine/issue-editor/IssueEditor";

type PageProps = {
  params: Promise<{ issueId: string }>;
};

export default async function AdminEditIssuePage({ params }: PageProps) {
  const { issueId } = await params;
  return (
    <div className="my-4 mx-4 sm:mx-10">
      <IssueEditor issueId={issueId} />
    </div>
  );
}
