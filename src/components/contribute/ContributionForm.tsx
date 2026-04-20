"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import {
  CloudUploadIcon,
  ChevronDownIcon,
  FileTextIcon,
  Grid2x2Icon,
  TrashIcon,
} from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { CONTRIBUTION_FORM_INPUT_BASE as inputBase, COUNTRY_CODES } from "@/lib/constants";
import { appendContributionFile, createContribution } from "@/services/contributions.service";
import { uploadFileForContribution } from "@/services/uploads.service";

type UploadedFile = { id: string; file: File; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ContributionFormProps = {
  selectedTypeId: string | null;
};

const borderVar = { borderColor: "var(--tott-card-border)" } as const;

export function ContributionForm({ selectedTypeId }: ContributionFormProps) {
  const t = useTranslations("Contribute.form");
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      sizeLabel: formatFileSize(file.size),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement | null)?.value ?? "";
    const description =
      (form.elements.namedItem("description") as HTMLTextAreaElement | null)?.value ?? "";
    const contributorName =
      (form.elements.namedItem("name") as HTMLInputElement | null)?.value ?? "";
    const contributorEmail =
      (form.elements.namedItem("email") as HTMLInputElement | null)?.value ?? "";
    const countryCode =
      (form.elements.namedItem("countryCode") as HTMLSelectElement | null)?.value ?? "";
    const mobile = (form.elements.namedItem("mobile") as HTMLInputElement | null)?.value ?? "";

    const phone = `${countryCode}${mobile}`.trim();

    setSubmitError(null);
    setIsSubmitting(true);
    const defaultSubmitError = t("submitErrorDefault");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("contributor_name", contributorName.trim());
      fd.append("contributor_email", contributorEmail.trim());
      fd.append("consent_given", "true");
      if (selectedTypeId) fd.append("type_id", selectedTypeId);
      if (phone && phone !== countryCode) fd.append("contributor_phone", phone);

      for (const f of files) {
        const { storageKey, mimeType } = await uploadFileForContribution(f.file);
        appendContributionFile(
          fd,
          storageKey,
          mimeType || f.file.type || "application/octet-stream",
          f.file,
        );
      }

      await createContribution(fd);
      router.push("/contribute/success");
    } catch (err) {
      let msg = defaultSubmitError;
      if (isAxiosError(err)) {
        const d = err.response?.data;
        if (typeof d === "string" && d.trim()) msg = d;
        else if (d && typeof d === "object") {
          const o = d as Record<string, unknown>;
          const inner = o.data as Record<string, unknown> | undefined;
          const m =
            (typeof inner?.message === "string" && inner.message) ||
            (typeof o.message === "string" && o.message) ||
            (Array.isArray(o.message) && o.message.map(String).join("; "));
          if (m) msg = m;
          else if (typeof o.error === "string") msg = o.error;
        }
        if (msg === defaultSubmitError && err.message) msg = err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-[80vw] max-w-[80vw] select-none space-y-4 sm:w-full sm:max-w-xl sm:space-y-5"
    >
      <div>
        <label className="mb-1 block select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("titleLabel")}
        </label>
        <input
          name="title"
          type="text"
          placeholder={t("titlePlaceholder")}
          className={inputBase}
          style={borderVar}
        />
      </div>

      <div>
        <label className="mb-1 block cursor-pointer select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("collectionLabel")}{" "}
          <span className="text-gray-500 dark:text-gray-400">{t("optional")}</span>
        </label>
        <div className="relative select-none">
          <select
            name="collection"
            className={`${inputBase} appearance-none pr-10`}
            style={borderVar}
          >
            <option value="">{t("collectionPlaceholder")}</option>
            <option value="stories">{t("collectionStories")}</option>
            <option value="documents">{t("collectionDocuments")}</option>
            <option value="media">{t("collectionMedia")}</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("descriptionLabel")}
        </label>
        <textarea
          name="description"
          rows={4}
          placeholder={t("descriptionPlaceholder")}
          className={inputBase}
          style={borderVar}
        />
      </div>

      <div>
        <label className="mb-1 block select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("uploadLabel")}
        </label>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`flex select-none flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors sm:px-6 sm:py-10 ${
            isDragging
              ? "border-[#C9A96E] bg-[#C9A96E]/10"
              : "border-[var(--tott-card-border)] bg-[var(--tott-well-bg)]"
          }`}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
            onChange={(e) => addFiles(e.target.files)}
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer select-none flex-col items-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <span style={{ color: theme.accentGoldFocus }}>
              <CloudUploadIcon />
            </span>
            <span className="text-center text-xs sm:text-sm">{t("uploadHint")}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("uploadFormats")}</span>
          </label>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 select-none space-y-2">
            {files.map(({ id, file, sizeLabel }) => (
              <li
                key={id}
                className="flex select-none items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] px-3 py-2 sm:gap-3 sm:px-4 sm:py-3"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  <FileTextIcon />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{file.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{sizeLabel}</span>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="select-none rounded p-1 text-gray-600 hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A96E] dark:text-gray-400"
                  aria-label={t("removeFileAria")}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-1 block select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("nameLabel")}
        </label>
        <input
          name="name"
          type="text"
          placeholder={t("namePlaceholder")}
          className={inputBase}
          style={borderVar}
        />
      </div>

      <div>
        <label className="mb-1 block select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("emailLabel")}
        </label>
        <input
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          className={inputBase}
          style={borderVar}
        />
      </div>

      <div>
        <label className="mb-1 block select-none text-xs font-medium text-foreground sm:mb-1.5 sm:text-sm">
          {t("mobileLabel")}{" "}
          <span className="text-gray-500 dark:text-gray-400">{t("optional")}</span>
        </label>
        <div
          className="flex select-none items-stretch overflow-hidden rounded-lg border border-[var(--tott-card-border)]"
        >
          <div className="relative flex w-[120px] shrink-0 cursor-pointer select-none items-center border-r border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] sm:w-[140px]">
            <select
              name="countryCode"
              className="absolute inset-0 z-10 cursor-pointer select-none appearance-none border-0 bg-transparent py-2 pl-6 pr-6 text-xs text-foreground focus:outline-none focus:ring-0 sm:py-2.5 sm:pl-8 sm:pr-8"
              defaultValue="+20"
            >
              {COUNTRY_CODES.map(({ code, country }) => (
                <option
                  key={code}
                  value={code}
                  className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]"
                >
                  {code} {country}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 [&>svg]:h-4 [&>svg]:w-4">
              <Grid2x2Icon />
            </span>
            <span
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 [&>svg]:h-4 [&>svg]:w-4"
              aria-hidden
            >
              <ChevronDownIcon />
            </span>
          </div>
          <input
            name="mobile"
            type="tel"
            placeholder={t("mobilePlaceholder")}
            className={`${inputBase} min-w-0 flex-1 rounded-none border-0 border-l-0`}
            style={{ borderColor: "transparent" }}
          />
        </div>
      </div>

      <p className="select-none text-xs text-gray-600 dark:text-gray-400">{t("consent")}</p>
      <p className="select-none text-xs text-gray-500 dark:text-gray-500">{t("technicalNote")}</p>

      {submitError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {submitError}
        </p>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full select-none cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-3.5 sm:text-base"
          style={{
            backgroundColor: theme.accentGold,
            boxShadow: `0 0 0 1px ${theme.accentGold}`,
            color: theme.bgDark,
          }}
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}
