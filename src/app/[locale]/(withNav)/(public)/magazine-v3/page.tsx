// Figma-redesign magazine homepage preview. Compared against /magazine for
// user + founder review; NOT wired into navigation. On approval, /magazine
// is repointed at MagazineV3Page.
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MagazineV3Page } from "@/components/home/magazine-v3/MagazineV3Page";

// Highly dynamic (articles, collections change any time).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MagazineV3" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/magazine-v3`,
      languages: {
        en: "/en/magazine-v3",
        ar: "/ar/magazine-v3",
        es: "/es/magazine-v3",
        fr: "/fr/magazine-v3",
        "x-default": "/en/magazine-v3",
      },
    },
  };
}

export default async function MagazineV3({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MagazineV3Page locale={locale} />;
}
