// The homepage temporarily shows the shared Coming Soon page while the team
// decides what to feature. The full editorial homepage is preserved verbatim in
// `./_home-original.tsx` — restore it by copying that component back here.
// No pages or code were removed.
import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";

export default async function Home() {
  const t = await getTranslations("ComingSoon");

  return (
    <ComingSoon
      badge={t("shared.badge")}
      title={t("features.home.title")}
      description={t("features.home.description")}
      ctaLabel={t("shared.ctaLabel")}
      ctaHref="/magazine"
    />
  );
}
