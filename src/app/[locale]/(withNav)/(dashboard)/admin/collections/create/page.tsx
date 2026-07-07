import { CollectionFormContent } from "@/components/dashboard/admin/collections/CollectionFormContent";

type PageProps = {
  searchParams: Promise<{ language?: string; translation_of?: string }>;
};

export default async function AdminCreateCollectionPage({ searchParams }: PageProps) {
  const { language, translation_of } = await searchParams;
  return (
    <CollectionFormContent createLanguage={language} translationOf={translation_of} />
  );
}
