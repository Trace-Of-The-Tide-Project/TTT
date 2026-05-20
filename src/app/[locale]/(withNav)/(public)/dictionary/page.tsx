import { getDictionaryEntries } from "@/services/dictionary.service";
import {
  DictionaryIndexContent,
  type DictionaryListItem,
} from "@/components/dictionary/DictionaryIndexContent";

export const dynamic = "force-dynamic";

export default async function DictionaryIndexPage() {
  const raw = await getDictionaryEntries({ limit: 60 });

  const entries: DictionaryListItem[] = raw
    .map((e) => {
      const author =
        e.user?.profile?.display_name?.trim() ||
        e.user?.full_name?.trim() ||
        e.user?.username?.trim() ||
        e.author_name?.trim() ||
        "";
      const jobTitle = e.user?.profile?.job_title?.trim() || "";
      const year =
        e.createdAt && !Number.isNaN(Date.parse(e.createdAt))
          ? new Date(e.createdAt).getFullYear().toString()
          : "";
      return {
        id: e.id,
        word: e.title?.trim() || "",
        body: e.definition_or_thought?.trim() || "",
        author: author ? `— ${author}` : "",
        role: [jobTitle, year].filter(Boolean).join(" · "),
      };
    })
    .filter((d) => d.word && d.body);

  return <DictionaryIndexContent entries={entries} />;
}
