// The rebuilt editorial homepage (Sessions 0–6). The previous CMS-driven
// homepage is preserved verbatim in `./_home-original.tsx`; the interim
// Coming Soon page lives on as the shared `@/components/ui/ComingSoon`.
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import type { CmsPage } from "@/services/cms.service";
import { HOME_PAGE_SLUG } from "@/services/home-page.service";
import { HomePage } from "@/components/home/HomePage";
import { SITE_URL } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomeNext" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ar: "/ar",
        es: "/es",
        fr: "/fr",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: `/${locale}`,
      siteName: "Trace of the Tide",
      type: "website",
      locale,
      // Page-level openGraph replaces the [locale] segment's resolved
      // openGraph, dropping the file-convention image — reference the
      // opengraph-image route explicitly instead.
      images: [
        {
          url: `/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Trace of the Tide",
        },
      ],
    },
    twitter: { card: "summary_large_image" },
  };
}

// Brand entities are language-neutral; localized page copy carries the rest.
// Static, fully server-controlled JSON (no user input) — safe to inline.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Trace of the Tide",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Trace of the Tide",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#org` },
      inLanguage: ["en", "ar", "es", "fr"],
    },
  ],
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // CMS framing for the rebuilt homepage's `home_next_*` sections. Failure
  // tolerant — serverGet returns null when the page hasn't been seeded yet,
  // and HomePage falls back to its seed order in that case.
  const pageRaw = await serverGet<CmsPage | { data: CmsPage }>(
    `/cms/pages/slug/${HOME_PAGE_SLUG}`,
  );
  const page =
    pageRaw && typeof pageRaw === "object" && "data" in pageRaw
      ? (pageRaw as { data: CmsPage }).data
      : (pageRaw as CmsPage | null);

  return (
    <>
      {/* Static, fully server-controlled JSON (no user input) — safe to inline. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <HomePage page={page} locale={locale} />
    </>
  );
}
