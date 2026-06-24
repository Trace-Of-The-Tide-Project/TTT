// "Fields" now shows a Coming Soon page. The previous behavior — a
// server redirect to /magazine — is preserved in `./_redirect-original.ts`
// and can be restored from there.
import { getTranslations } from "next-intl/server";
import ComingSoon from "@/components/ui/ComingSoon";

export default async function FieldsPage() {
  const t = await getTranslations("ComingSoon");

  return (
    <ComingSoon
      badge={t("shared.badge")}
      title={t("features.fields.title")}
      description={t("features.fields.description")}
      ctaLabel={t("shared.ctaLabel")}
      homeLabel={t("shared.homeLabel")}
    />
  );
}
