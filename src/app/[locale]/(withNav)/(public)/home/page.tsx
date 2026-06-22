import { serverGet } from "@/lib/api/isomorphic-fetch";
import type { CmsPage } from "@/services/cms.service";
import { HOME_PAGE_SLUG, findHomeSection, parseHeroConfig } from "@/services/home-page.service";
import { fetchHomeData } from "@/lib/home/fetch-home-data";
import { HomeSections } from "@/components/home/HomeSections";
import { HomeD01 } from "@/components/home/directions/HomeD01";
import { HomeD02 } from "@/components/home/directions/HomeD02";
import { HomeD03 } from "@/components/home/directions/HomeD03";

/**
 * Redesigned homepage — an editorial front page of the archive.
 *
 * CMS-section-driven (mirrors `/magazine`): the home CMS page
 * (`/cms/pages/slug/home`) supplies section order, visibility, and
 * locale copy; the data rails come live from the backend APIs. When the
 * CMS page is absent, `HomeSections` falls back to the seed order, so
 * the page renders fully without any admin setup.
 */
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch CMS framing + live rail data in parallel. `serverGet` returns
  // null on failure (e.g. the page hasn't been seeded yet) — the
  // renderer falls back to the seed order in that case.
  const [pageRaw, data] = await Promise.all([
    serverGet<CmsPage | { data: CmsPage }>(`/cms/pages/slug/${HOME_PAGE_SLUG}`),
    fetchHomeData(locale),
  ]);

  // The CMS endpoint may wrap the page in `{ data: ... }`.
  const page =
    pageRaw && typeof pageRaw === "object" && "data" in pageRaw
      ? (pageRaw as { data: CmsPage }).data
      : (pageRaw as CmsPage | null);

  // Check for an admin-selected full-page direction variant.
  const heroSection = findHomeSection(page, "hero");
  const heroConfig = parseHeroConfig(heroSection);
  const dir = locale === "ar" ? "rtl" : "ltr";

  if (heroConfig.variant === "d01") {
    return <HomeD01 data={data} locale={locale} dir={dir} />;
  }
  if (heroConfig.variant === "d02") {
    return <HomeD02 data={data} locale={locale} dir={dir} />;
  }
  if (heroConfig.variant === "d03") {
    return <HomeD03 data={data} locale={locale} dir={dir} />;
  }

  return (
    <main className="min-h-0">
      <HomeSections page={page ?? null} data={data} locale={locale} />
    </main>
  );
}
