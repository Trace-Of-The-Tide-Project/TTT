import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArchiveListing } from "@/components/archive/ArchiveListing";

// Commons transitions happen on an hourly cron and articles publish anytime —
// never cache, same as the other listing pages.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Content");
  return { title: t("archive.heading") };
}

type ArchiveSearchParams = {
  page?: string;
  search?: string;
  content_type?: string;
  language?: string;
};

/** `/archive` — FR-CMN-03 faceted browse of commons-eligible content. */
export default function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<ArchiveSearchParams>;
}) {
  return <ArchiveListing searchParams={searchParams} />;
}
