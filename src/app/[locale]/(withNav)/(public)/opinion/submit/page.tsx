import { getTranslations } from "next-intl/server";
import { SupportPageLayout } from "@/components/layout/SupportPageLayout";
import { OpinionSubmitForm } from "@/components/opinionSubmit/OpinionSubmitForm";

export default async function OpinionSubmitPage() {
  const t = await getTranslations("OpinionSubmit");

  return (
    <SupportPageLayout title={t("title")} subtitle={t("subtitle")}>
      <OpinionSubmitForm />
    </SupportPageLayout>
  );
}
