import { CollectionFormContent } from "@/components/dashboard/admin/collections/CollectionFormContent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditCollectionPage({ params }: PageProps) {
  const { id } = await params;
  return <CollectionFormContent key={id} collectionId={id} />;
}
