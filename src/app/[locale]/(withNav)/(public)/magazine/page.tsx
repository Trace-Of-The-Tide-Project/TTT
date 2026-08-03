import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MagazinePage } from "@/components/home/magazine-page/MagazinePage";

// Highly dynamic (articles, collections change any time).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Magazine" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/magazine`,
      languages: {
        en: "/en/magazine",
        ar: "/ar/magazine",
        es: "/es/magazine",
        fr: "/fr/magazine",
        "x-default": "/en/magazine",
      },
    },
  };
}

export default async function Magazine({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MagazinePage locale={locale} />;
}
