// Scroll-first magazine homepage (rebuild preview). Swaps to /magazine on
// approval. The live tab-based page remains at /magazine until then.
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MagazineNextPage } from "@/components/home/magazine-next/MagazineNextPage";

// Highly dynamic (issues, articles, books, writers change any time).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MagazineNext" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/magazine-next`,
      languages: {
        en: "/en/magazine-next",
        ar: "/ar/magazine-next",
        es: "/es/magazine-next",
        fr: "/fr/magazine-next",
        "x-default": "/en/magazine-next",
      },
    },
  };
}

export default async function MagazineNext({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MagazineNextPage locale={locale} />;
}
