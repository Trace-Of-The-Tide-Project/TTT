import { notFound } from "next/navigation";
import { getWriter, writerAvatar, writerDisplayName } from "@/services/writers.service";
import {
  WriterDetailContent,
  type WriterDetailView,
} from "@/components/writers/WriterDetailContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function WriterDetailPage({ params }: PageProps) {
  const { id } = await params;
  const writer = await getWriter(id);
  if (!writer) return notFound();

  const view: WriterDetailView = {
    id: writer.id,
    userId: writer.user_id ?? writer.user?.id ?? null,
    name: writerDisplayName(writer) || "Writer",
    bio: writer.bio?.trim() || null,
    edition: writer.edition?.trim() || null,
    avatar: writerAvatar(writer),
  };

  return <WriterDetailContent writer={view} />;
}
