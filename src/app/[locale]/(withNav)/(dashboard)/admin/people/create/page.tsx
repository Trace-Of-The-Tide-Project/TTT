import { PersonFormContent } from "@/components/dashboard/admin/people";

type PageProps = {
  searchParams: Promise<{ language?: string; translation_of?: string }>;
};

export default async function AdminCreatePersonPage({ searchParams }: PageProps) {
  const { language, translation_of } = await searchParams;
  return (
    <PersonFormContent createLanguage={language} translationOf={translation_of} />
  );
}
