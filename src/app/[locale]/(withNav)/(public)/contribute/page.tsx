// "Trace a story" now shows a Coming Soon page. The previous, fully
// working "Leave a Trace" contribution form is preserved in
// `./_contribute-original.tsx` and can be restored from there.
import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";

export default async function ContributePage() {
  const t = await getTranslations("ComingSoon");

  return (
    <ComingSoon
      badge={t("shared.badge")}
      title={t("features.traceAStory.title")}
      description={t("features.traceAStory.description")}
      ctaLabel={t("shared.ctaLabel")}
      homeLabel={t("shared.homeLabel")}
      iconKey="pen"
    />
  );
}
