import { getTranslations } from "next-intl/server";
import HexBackground404 from "@/components/ui/HexBackground404";
import NotFound404Content from "@/components/ui/NotFound404Content";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="absolute inset-0">
        <HexBackground404 />
      </div>

      <NotFound404Content
        title={t("title")}
        heading={t("heading")}
        body={t("body")}
        cta={t("cta")}
        contactPrompt={t("contactPrompt")}
        contact={t("contact")}
        contactSuffix={t("contactSuffix")}
      />
    </div>
  );
}
