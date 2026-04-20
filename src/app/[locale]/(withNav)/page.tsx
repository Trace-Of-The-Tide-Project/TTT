import { redirect } from "@/i18n/navigation";

/** Temporary: land on admin dashboard instead of marketing home. */
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/admin", locale });
}
