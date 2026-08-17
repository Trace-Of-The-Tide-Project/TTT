import { getTranslations } from "next-intl/server";
import { SupportPageLayout } from "@/components/layout/SupportPageLayout";
import { GiftATraceForm } from "@/components/giftATrace/GiftATraceForm";

export default async function GiftATracePage() {
  const t = await getTranslations("GiftATrace");

  return (
    <SupportPageLayout title={t("title")} subtitle={t("subtitle")}>
      <GiftATraceForm />
    </SupportPageLayout>
  );
}
