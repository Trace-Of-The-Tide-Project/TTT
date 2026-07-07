import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";

export default async function BeANeighborPage() {
  const t = await getTranslations("ComingSoon");

  return (
    <ComingSoon
      badge={t("shared.badge")}
      title={t("features.beANeighbor.title")}
      description={t("features.beANeighbor.description")}
      ctaLabel={t("shared.ctaLabel")}
      homeLabel={t("shared.homeLabel")}
    />
  );
}
