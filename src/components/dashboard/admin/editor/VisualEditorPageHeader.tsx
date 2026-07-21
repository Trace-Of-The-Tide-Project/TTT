"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { theme } from "@/lib/theme";
import { EyeIcon, FileTextIcon } from "@/components/ui/icons";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { publishCmsPage } from "@/services/cms.service";
import { useVisualEditorTab } from "./VisualEditorTabContext";

type PublishState = "idle" | "publishing" | "published" | "error";

/** Public route each tab's "Preview in new tab" button opens. Static/nav/
 *  branding don't map to one page, so they fall back to the homepage —
 *  same behavior as before this fix, just scoped per tab instead of always. */
function previewPathFor(tab: string, locale: string): string {
  if (tab === "home") return `/${locale}/home`;
  return `/${locale}/home`;
}

export function VisualEditorPageHeader() {
  const t = useTranslations("Dashboard.headers.visualEditor");
  const locale = useLocale();
  const { activeTab, draftState } = useVisualEditorTab();
  const [publishState, setPublishState] = useState<PublishState>("idle");

  const handlePreview = () => {
    // Secondary now that the inline iframe preview is the primary surface —
    // still useful to see the real published page in a full tab.
    window.open(previewPathFor(activeTab, locale), "_blank", "noopener,noreferrer");
  };

  const handlePublish = async () => {
    if (!draftState?.pageId) return;
    setPublishState("publishing");
    try {
      // Flush unsaved edits from whichever tab is active before publishing,
      // instead of publishing whatever was last saved (the previous bug).
      if (draftState.isDirty) await draftState.save();
      await publishCmsPage(draftState.pageId);
      setPublishState("published");
      setTimeout(() => setPublishState("idle"), 3000);
    } catch {
      setPublishState("error");
      setTimeout(() => setPublishState("idle"), 3000);
    }
  };

  const publishDisabled = publishState === "publishing" || !draftState?.pageId;

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
            disabled={publishDisabled}
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
              ? t("publishing")
              : publishState === "published"
                ? t("published")
                : publishState === "error"
                  ? t("publishError")
                  : t("publishChanges")}
          </button>
        </>
      }
    />
  );
}
