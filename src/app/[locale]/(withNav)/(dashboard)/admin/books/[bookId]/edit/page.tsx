import { BookFormContent } from "@/components/dashboard/admin/books";

type PageProps = {
  params: Promise<{ bookId: string }>;
};

export default async function AdminEditBookPage({ params }: PageProps) {
  const { bookId } = await params;
  return <BookFormContent bookId={bookId} />;
}
