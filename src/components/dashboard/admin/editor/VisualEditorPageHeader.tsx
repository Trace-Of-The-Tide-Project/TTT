"use client";

import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { EyeIcon, FileTextIcon } from "@/components/ui/icons";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";

export function VisualEditorPageHeader() {
  const t = useTranslations("Dashboard.headers.visualEditor");
  return (
    <DashboardHeader
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">
              <EyeIcon />
            </span>
            {t("preview")}
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">
              <FileTextIcon />
            </span>
            {t("publishChanges")}
          </button>
        </>
      }
    />
  );
}
