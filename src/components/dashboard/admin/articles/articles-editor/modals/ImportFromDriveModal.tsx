"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { XIcon } from "@/components/ui/icons";
import { mutationToast } from "@/hooks/useMutationToast";
import { formatApiError } from "@/lib/api/error-message";
import { useImportFromGoogleDrive } from "@/hooks/mutations/articles-import";
import { htmlToContentBlocks } from "@/lib/content/html-to-blocks";
import type { ContentBlock } from "../ContentBlocks";

type ImportFromDriveModalProps = {
  open: boolean;
  /** Editor already has a title or non-placeholder blocks — importing
   * overwrites them, so the user gets an explicit confirm step first. */
  hasExistingContent: boolean;
  onClose: () => void;
  onImported: (result: { title: string; blocks: ContentBlock[] }) => void;
};

export function ImportFromDriveModal({
  open,
  hasExistingContent,
  onClose,
  onImported,
}: ImportFromDriveModalProps) {
  const t = useTranslations("Dashboard.articles.editor.modals.importDrive");
  const tModals = useTranslations("Dashboard.articles.editor.modals");
  const importMutation = useImportFromGoogleDrive();

  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  const busy = importMutation.isPending;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    },
    [busy, onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  // Reset each time the modal opens.
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setUrl("");
    setError(null);
    setConfirmingOverwrite(false);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  if (!open) return null;

  const runImport = async () => {
    setError(null);
    try {
      const result = await mutationToast(() => importMutation.mutateAsync(url.trim()), {
        loading: t("toastLoading"),
        success: t("toastSuccess"),
        error: t("toastError"),
      });
      const blocks = htmlToContentBlocks(result.html);
      onImported({ title: result.title, blocks });
      if (result.images > 0) toast.message(t("imagesImported", { count: result.images }));
      onClose();
    } catch (err) {
      setError(formatApiError(err, t("toastError")));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError(t("errorEmpty"));
      return;
    }
    if (hasExistingContent && !confirmingOverwrite) {
      setConfirmingOverwrite(true);
      return;
    }
    void runImport();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !busy && onClose()}
        aria-label={tModals("closeDialog")}
      />

      <div
        className="relative mx-4 w-full max-w-md rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-drive-title"
      >
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-4">
          <div>
            <h2 id="import-drive-title" className="text-lg font-bold text-foreground">
              {confirmingOverwrite ? t("overwriteTitle") : t("title")}
            </h2>
            {!confirmingOverwrite ? (
              <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label={tModals("close")}
            disabled={busy}
          >
            <XIcon />
          </button>
        </div>

        {confirmingOverwrite ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--tott-muted)]">{t("overwriteDescription")}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmingOverwrite(false)}
                className="rounded-lg border border-[var(--tott-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
              >
                {t("overwriteCancel")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runImport()}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--tott-accent-gold)" }}
              >
                {busy ? t("submitBusy") : t("overwriteConfirm")}
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1.5 text-sm text-[var(--tott-muted)]">
              <span>{t("urlLabel")}</span>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder={t("urlPlaceholder")}
                disabled={busy}
                required
                dir="ltr"
                className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2.5 text-sm text-foreground outline-none focus:border-[var(--tott-card-border)] disabled:opacity-50"
              />
              <span className="text-xs text-[var(--tott-muted)]">{t("shareHint")}</span>
            </label>
            {error ? (
              <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className="rounded-lg border border-[var(--tott-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--tott-accent-gold)" }}
              >
                {busy ? t("submitBusy") : t("submit")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
