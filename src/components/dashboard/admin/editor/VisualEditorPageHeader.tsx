"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { theme } from "@/lib/theme";
import { EyeIcon, FileTextIcon } from "@/components/ui/icons";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { getCmsHomepage, publishCmsPage } from "@/services/cms.service";

type PublishState = "idle" | "publishing" | "published" | "error";

export function VisualEditorPageHeader() {
  const t = useTranslations("Dashboard.headers.visualEditor");
  const locale = useLocale();
  const [publishState, setPublishState] = useState<PublishState>("idle");

  const handlePreview = () => {
    // Open the live public homepage (CMS slug "home") in a new tab.
    window.open(`/${locale}/home`, "_blank", "noopener,noreferrer");
  };

  const handlePublish = async () => {
    setPublishState("publishing");
    try {
      const page = await getCmsHomepage();
      await publishCmsPage(page.id);
      setPublishState("published");
      setTimeout(() => setPublishState("idle"), 3000);
    } catch {
      setPublishState("error");
      setTimeout(() => setPublishState("idle"), 3000);
    }
  };

  return (
    <DashboardHeader
        lastUpdated
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <>
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">
              <EyeIcon />
            </span>
            {t("preview")}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishState === "publishing"}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            style={
              publishState === "published"
                ? { backgroundColor: "#22c55e", color: "#fff" }
                : publishState === "error"
                  ? { backgroundColor: "#ef4444", color: "#fff" }
                  : { backgroundColor: theme.accentGoldFocus, color: theme.bgDark }
            }
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">
              <FileTextIcon />
            </span>
            {publishState === "publishing"
              ? "Publishing…"
              : publishState === "published"
                ? "Published!"
                : publishState === "error"
                  ? "Error"
                  : t("publishChanges")}
          </button>
        </>
      }
    />
  );
}
