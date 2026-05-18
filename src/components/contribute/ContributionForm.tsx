"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import {
  CloudUploadIcon,
  FileTextIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { COUNTRY_CODES } from "@/lib/constants";
import {
  appendContributionFile,
  createContribution,
} from "@/services/contributions.service";
import { uploadFileForContribution } from "@/services/uploads.service";

const FIELD_BG = "#262626";
const FIELD_BORDER = "#333333";
const FIELD_RADIUS = 8;
const LABEL_COLOR = "#FFFFFF";
const HELPER_COLOR = "#A3A3A3";
const PLACEHOLDER_COLOR = "#7B7B7B";
const ACCENT = "#C9A96E";
const ACCENT_TEXT = "#332217";

type UploadedFile = { id: string; file: File; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ContributionFormProps = {
  selectedTypeId: string | null;
};

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
    const title =
      (form.elements.namedItem("title") as HTMLInputElement | null)?.value ?? "";
    const description =
      (form.elements.namedItem("description") as HTMLTextAreaElement | null)
        ?.value ?? "";
    const contributorName =
      (form.elements.namedItem("name") as HTMLInputElement | null)?.value ?? "";
    const contributorEmail =
      (form.elements.namedItem("email") as HTMLInputElement | null)?.value ?? "";
    const countryCode =
      (form.elements.namedItem("countryCode") as HTMLSelectElement | null)
        ?.value ?? "";
    const mobile =
      (form.elements.namedItem("mobile") as HTMLInputElement | null)?.value ?? "";

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
      className="flex w-full flex-col items-stretch"
      style={{ gap: "24px" }}
    >
      {/* Title */}
      <Field label={t("titleLabel")}>
        <span style={inputBoxStyle}>
          <input
            name="title"
            type="text"
            placeholder={t("titlePlaceholder")}
            style={inputElementStyle}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
          />
        </span>
      </Field>

      {/* Collection select */}
      <Field label={t("collectionLabel")} optionalLabel={t("optional")}>
        <span style={{ ...inputBoxStyle, position: "relative" }}>
          <select
            name="collection"
            defaultValue=""
            style={{
              ...inputElementStyle,
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              backgroundImage: "none",
              cursor: "pointer",
              paddingRight: "28px",
            }}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
          >
            <option
              value=""
              style={{ backgroundColor: FIELD_BG, color: PLACEHOLDER_COLOR }}
            >
              {t("collectionPlaceholder")}
            </option>
            <option
              value="stories"
              style={{ backgroundColor: FIELD_BG, color: LABEL_COLOR }}
            >
              {t("collectionStories")}
            </option>
            <option
              value="documents"
              style={{ backgroundColor: FIELD_BG, color: LABEL_COLOR }}
            >
              {t("collectionDocuments")}
            </option>
            <option
              value="media"
              style={{ backgroundColor: FIELD_BG, color: LABEL_COLOR }}
            >
              {t("collectionMedia")}
            </option>
          </select>
          <TrailingChevron />
        </span>
      </Field>

      {/* Description */}
      <Field label={t("descriptionLabel")}>
        <span
          className="relative w-full"
          style={{
            backgroundColor: FIELD_BG,
            border: `1px solid ${FIELD_BORDER}`,
            borderRadius: `${FIELD_RADIUS}px`,
          }}
        >
          <textarea
            name="description"
            rows={5}
            placeholder={t("descriptionPlaceholder")}
            className="block w-full resize-y bg-transparent focus:outline-none"
            style={{
              height: "112px",
              padding: "8px 12px",
              color: LABEL_COLOR,
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0.005em",
              border: "none",
              borderRadius: `${FIELD_RADIUS}px`,
              boxSizing: "border-box",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              width: "6px",
              height: "6px",
              right: "8px",
              bottom: "8px",
              backgroundColor: "#5C5C5C",
            }}
          />
        </span>
      </Field>

      {/* Upload */}
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <span className="flex flex-row items-center" style={{ gap: "8px" }}>
            <span style={labelStyle}>{t("uploadLabel")}</span>
            <span style={optionalStyle}>{t("uploadHelper")}</span>
          </span>
          <label
            htmlFor="file-upload"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className="flex w-full cursor-pointer flex-col items-center justify-center transition-colors"
            style={{
              padding: "24px",
              gap: "8px",
              backgroundColor: FIELD_BG,
              border: `1px dashed ${isDragging ? ACCENT : FIELD_BORDER}`,
              borderRadius: `${FIELD_RADIUS}px`,
              minHeight: "120px",
              boxSizing: "border-box",
            }}
          >
            <input
              type="file"
              multiple
              className="hidden"
              id="file-upload"
              onChange={(e) => addFiles(e.target.files)}
            />
            <span
              aria-hidden
              className="inline-flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
              style={{ color: HELPER_COLOR }}
            >
              <CloudUploadIcon />
            </span>
            <span
              className="text-center"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: LABEL_COLOR,
              }}
            >
              {t("uploadHint")}
            </span>
            <span
              className="text-center"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: HELPER_COLOR,
              }}
            >
              {t("uploadFormats")}
            </span>
          </label>
        </div>

        {files.length > 0 ? (
          <ul className="flex flex-col" style={{ gap: "8px" }}>
            {files.map(({ id, file, sizeLabel }) => (
              <li
                key={id}
                className="flex w-full flex-row items-center"
                style={{
                  padding: "12px",
                  gap: "12px",
                  backgroundColor: FIELD_BG,
                  border: `1px solid ${FIELD_BORDER}`,
                  borderRadius: `${FIELD_RADIUS}px`,
                  boxSizing: "border-box",
                }}
              >
                <span
                  aria-hidden
                  className="inline-flex shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: `1px solid ${FIELD_BORDER}`,
                    borderRadius: "4px",
                    color: HELPER_COLOR,
                  }}
                >
                  <FileTextIcon />
                </span>
                <div
                  className="flex min-w-0 flex-1 flex-col"
                  style={{ gap: "4px" }}
                >
                  <span
                    className="truncate"
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      color: "rgba(255, 255, 255, 0.72)",
                    }}
                  >
                    {file.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "16px",
                      color: "rgba(255, 255, 255, 0.48)",
                    }}
                  >
                    {sizeLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2"
                  style={{
                    width: "24px",
                    height: "24px",
                    padding: "4px",
                    borderRadius: "6px",
                    background: "transparent",
                    border: "none",
                    color: HELPER_COLOR,
                    cursor: "pointer",
                  }}
                  aria-label={t("removeFileAria")}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Name */}
      <Field label={t("nameLabel")}>
        <span style={inputBoxStyle}>
          <input
            name="name"
            type="text"
            placeholder={t("namePlaceholder")}
            style={inputElementStyle}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
          />
        </span>
      </Field>

      {/* Email */}
      <Field label={t("emailLabel")}>
        <span style={inputBoxStyle}>
          <input
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            style={inputElementStyle}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
          />
        </span>
      </Field>

      {/* Phone — 44px tall, with country code section + separator */}
      <Field label={t("mobileLabel")} optionalLabel={t("optional")}>
        <span
          className="flex w-full flex-row items-center"
          style={{
            height: "44px",
            padding: "8px",
            backgroundColor: FIELD_BG,
            border: `1px solid ${FIELD_BORDER}`,
            borderRadius: `${FIELD_RADIUS}px`,
            boxSizing: "border-box",
          }}
        >
          <span
            className="relative inline-flex shrink-0 items-center"
            style={{
              height: "24px",
              padding: "2px 0",
              borderRight: "1px solid #5C5C5C",
              paddingRight: "8px",
              marginRight: "8px",
            }}
          >
            <select
              name="countryCode"
              defaultValue="+20"
              className="appearance-none bg-transparent focus:outline-none"
              style={{
                paddingLeft: "8px",
                paddingRight: "24px",
                color: PLACEHOLDER_COLOR,
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                border: "none",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                backgroundImage: "none",
              }}
            >
              {COUNTRY_CODES.map(({ code, country }) => (
                <option
                  key={code}
                  value={code}
                  style={{ backgroundColor: FIELD_BG, color: LABEL_COLOR }}
                >
                  {code} {country}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                color: PLACEHOLDER_COLOR,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </span>
          <input
            name="mobile"
            type="tel"
            placeholder={t("mobilePlaceholder")}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
            style={{
              padding: "2px 8px",
              color: LABEL_COLOR,
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              border: "none",
            }}
          />
        </span>
      </Field>

      {/* Consent */}
      <p
        style={{
          margin: 0,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "12px",
          lineHeight: "16px",
          color: PLACEHOLDER_COLOR,
        }}
      >
        {t("consent")}
      </p>

      {submitError ? (
        <p
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: "rgba(220,38,38,0.35)",
            backgroundColor: "rgba(220,38,38,0.08)",
            color: "var(--tott-dash-negative)",
            margin: 0,
          }}
        >
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          height: "40px",
          padding: "8px 16px",
          borderRadius: `${FIELD_RADIUS}px`,
          backgroundColor: ACCENT,
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: ACCENT_TEXT,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          textAlign: "center",
          border: "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
        }}
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

// ─── Field / Input building blocks ───────────────────────────────

const inputBoxStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  height: "40px",
  padding: "8px",
  width: "100%",
  backgroundColor: FIELD_BG,
  border: `1px solid ${FIELD_BORDER}`,
  borderRadius: `${FIELD_RADIUS}px`,
  boxSizing: "border-box",
};

const inputElementStyle: React.CSSProperties = {
  padding: "2px 8px",
  color: LABEL_COLOR,
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  border: "none",
  background: "transparent",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: LABEL_COLOR,
};

const optionalStyle: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: HELPER_COLOR,
};

function Field({
  label,
  optionalLabel,
  children,
}: {
  label: string;
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex w-full flex-col" style={{ gap: "8px" }}>
      <span className="flex flex-row items-center" style={{ gap: "8px" }}>
        <span style={labelStyle}>{label}</span>
        {optionalLabel ? <span style={optionalStyle}>{optionalLabel}</span> : null}
      </span>
      {children}
    </label>
  );
}

function TrailingChevron() {
  // Figma "Trailing Icon" wrapper: 28px wide, 24px tall, 2/4 padding,
  // chevron centered inside. With the input's own 8px right padding,
  // that leaves the chevron's visual centerline ~22px from the input's
  // right edge — i.e. the 20px chevron sits at right: 12px.
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inline-flex items-center justify-center"
      style={{
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "20px",
        height: "20px",
        color: PLACEHOLDER_COLOR,
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  );
}
