"use client";

import { useTranslations } from "next-intl";
import { CameraIcon, SaveIcon, CalendarIcon } from "./ArticleEditorIcons";
import type { ArticleWorkflowStatus } from "./ArticleSettings";

type ContentEditorFooterProps = {
  primaryButtonLabel?: string;
  /** Create: "Save Draft". Edit: e.g. "Save changes". */
  saveDraftLabel?: string;
  workflowStatus: ArticleWorkflowStatus;
  busy?: boolean;
  error?: string | null;
  onPublish: () => void;
  onSaveDraft: () => void;
  onOpenSchedule: () => void;
};

export function ContentEditorFooter({
  primaryButtonLabel,
  saveDraftLabel,
  workflowStatus,
  busy = false,
  error,
  onPublish,
  onSaveDraft,
  onOpenSchedule,
}: ContentEditorFooterProps) {
  const t = useTranslations("Dashboard.articles.editor.footer");
  const primary = primaryButtonLabel ?? t("defaults.publishNow");
  const saveDraft = saveDraftLabel ?? t("defaults.saveDraft");
  const publishFlowEnabled = workflowStatus === "published" || workflowStatus === "scheduled";
  const disabledPrimary = busy || !publishFlowEnabled;

  return (
    <footer className="mt-6 border-t border-[var(--tott-card-border)] pt-6">
      <div className="flex flex-col items-stretch gap-3">
        {error ? (
          <p
            className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <button
          type="button"
          disabled={disabledPrimary}
          onClick={onPublish}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: "#C9A96E" }}
        >
          <CameraIcon />
          {primary}
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onSaveDraft}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--tott-dash-control-bg)] py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SaveIcon />
            {saveDraft}
          </button>
          <button
            type="button"
            disabled={busy || !publishFlowEnabled}
            onClick={onOpenSchedule}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--tott-dash-control-bg)] py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CalendarIcon />
            {t("schedule")}
          </button>
        </div>
      </div>
    </footer>
  );
}
