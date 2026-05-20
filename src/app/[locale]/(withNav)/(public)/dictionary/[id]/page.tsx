import { notFound } from "next/navigation";
import { getDictionaryEntry } from "@/services/dictionary.service";
import {
  DictionaryEntryContent,
  type DictionaryEntryView,
} from "@/components/dictionary/DictionaryEntryContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function DictionaryEntryPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await getDictionaryEntry(id);
  if (!entry) return notFound();

  const authorName =
    entry.user?.profile?.display_name?.trim() ||
    entry.user?.full_name?.trim() ||
    entry.user?.username?.trim() ||
    entry.author_name?.trim() ||
    "";
  const jobTitle = entry.user?.profile?.job_title?.trim() || "";
  const year =
    entry.createdAt && !Number.isNaN(Date.parse(entry.createdAt))
      ? new Date(entry.createdAt).getFullYear().toString()
      : "";

  const view: DictionaryEntryView = {
    id: entry.id,
    word: entry.title?.trim() || "",
    body: entry.definition_or_thought?.trim() || "",
    author: authorName ? `— ${authorName}` : "",
    role: [jobTitle, year].filter(Boolean).join(" · "),
  };

  if (!view.word || !view.body) return notFound();

  return <DictionaryEntryContent entry={view} />;
}
