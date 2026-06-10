import { WriterFormContent } from "@/components/dashboard/admin/writers";

type PageProps = {
  params: Promise<{ writerId: string }>;
};

export default async function AdminEditWriterPage({ params }: PageProps) {
  const { writerId } = await params;
  return <WriterFormContent writerId={writerId} />;
}
