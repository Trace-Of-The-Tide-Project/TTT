import { WriterFormContent } from "@/components/dashboard/admin/writers";

type PageProps = {
  searchParams: Promise<{ language?: string; translation_of?: string }>;
};

export default async function AdminCreateWriterPage({ searchParams }: PageProps) {
  const { language, translation_of } = await searchParams;
  return (
    <WriterFormContent createLanguage={language} translationOf={translation_of} />
  );
}
