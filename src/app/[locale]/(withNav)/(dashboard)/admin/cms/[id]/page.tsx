import { StaticPageEditorContent } from "@/components/dashboard/admin/cms/StaticPageEditorContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCmsPageEditorPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="my-4 mx-4 sm:mx-10">
      <StaticPageEditorContent pageId={id} />
    </div>
  );
}
