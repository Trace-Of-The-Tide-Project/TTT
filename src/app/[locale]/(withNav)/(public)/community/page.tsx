import { getLocale } from "next-intl/server";
import { getFeaturedWriters } from "@/services/writers.service";
import { getActiveOpenCalls } from "@/services/open-calls.service";
import { getCommunityGuidelines, splitGuidelines } from "@/services/system.service";
import { CommunityShowContent } from "@/components/community/CommunityShowContent";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const locale = await getLocale();
  // Each section fetches a public endpoint and degrades independently:
  // a failing fetch resolves to an empty value (services swallow errors),
  // so the page never throws inside the RSC.
  const [featuredWriters, openCalls, guidelines] = await Promise.all([
    getFeaturedWriters(locale),
    getActiveOpenCalls({ limit: 6, dedupe: "group", viewer_lang: locale }),
    getCommunityGuidelines(),
  ]);

  return (
    <CommunityShowContent
      featuredWriters={featuredWriters}
      openCalls={openCalls}
      guidelines={splitGuidelines(guidelines.community_guidelines)}
    />
  );
}
