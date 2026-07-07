import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";

export default async function GiftATracePage() {
  const t = await getTranslations("ComingSoon");

  return (
    <ComingSoon
      badge={t("shared.badge")}
      title={t("features.giftATrace.title")}
      description={t("features.giftATrace.description")}
      ctaLabel={t("shared.ctaLabel")}
      homeLabel={t("shared.homeLabel")}
    />
  );
}
