import { redirect } from "@/i18n/navigation";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/content/article", locale });
}
