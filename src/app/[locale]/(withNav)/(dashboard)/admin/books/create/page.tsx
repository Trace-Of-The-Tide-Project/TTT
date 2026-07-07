import { BookFormContent } from "@/components/dashboard/admin/books";

type PageProps = {
  searchParams: Promise<{ language?: string; translation_of?: string }>;
};

export default async function AdminCreateBookPage({ searchParams }: PageProps) {
  const { language, translation_of } = await searchParams;
  return (
    <BookFormContent createLanguage={language} translationOf={translation_of} />
  );
}
