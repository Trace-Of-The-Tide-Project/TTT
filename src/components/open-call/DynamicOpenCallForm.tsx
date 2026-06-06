"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { isAxiosError } from "axios";
import { Link } from "@/i18n/navigation";
import { useApplyToOpenCall } from "@/hooks/mutations/open-calls";
import { CloudUploadIcon, FileTextIcon, TrashIcon } from "@/components/ui/icons";
import {
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  UserIcon,
  MailIcon,
  PhoneIcon,
  FIELD_BG,
  FIELD_BORDER,
  FIELD_RADIUS,
  LABEL_COLOR,
  HELPER_COLOR,
  ACCENT,
  ACCENT_TEXT,
} from "@/components/contribute/ContributionFormFields";
import type { ApplicationFormField } from "@/services/open-calls.service";
import {
  resolveFieldParticipantLabel,
  resolveSelectOptionLabel,
} from "@/lib/application-form-labels";

const SANS = "'Inter', var(--font-sans, sans-serif)";

type UploadedFile = { id: string; file: File; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconForType(type: ApplicationFormField["type"]) {
  switch (type) {
    case "email":
      return <MailIcon />;
    case "phone":
      return <PhoneIcon />;
    default:
      return <UserIcon />;
  }
}

function TextField({
  field,
}: {
  field: ApplicationFormField & { type: "text" | "email" | "phone" };
}) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  return (
    <Field label={label}>
      <FieldInput
        name={field.name}
        type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
        placeholder={t("dynamic.enterField", { label })}
        required={field.required}
        icon={iconForType(field.type)}
      />
    </Field>
  );
}

function TextareaField({ field }: { field: ApplicationFormField & { type: "textarea" } }) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  return (
    <Field label={label}>
      <FieldTextarea
        name={field.name}
        rows={4}
        placeholder={t("dynamic.enterField", { label })}
        required={field.required}
      />
    </Field>
  );
}

function SelectField({ field }: { field: ApplicationFormField & { type: "select" } }) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  return (
    <Field label={label}>
      <FieldSelect
        name={field.name}
        required={field.required}
        defaultValue=""
        placeholder={t("dynamic.selectPlaceholder")}
      >
        {field.options.map((opt) => (
          <option
            key={opt}
            value={opt}
            style={{ backgroundColor: FIELD_BG, color: LABEL_COLOR }}
          >
            {resolveSelectOptionLabel(opt, t)}
          </option>
        ))}
      </FieldSelect>
    </Field>
  );
}

function CheckboxField({
  field,
  checked,
  onChange,
}: {
  field: ApplicationFormField & { type: "checkbox" };
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  return (
    <label className="flex cursor-pointer flex-row items-center" style={{ gap: "8px" }}>
      <span className="relative inline-block" style={{ width: "20px", height: "20px" }}>
        <input
          type="checkbox"
          name={field.name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={field.required}
          className="peer absolute inset-0 cursor-pointer opacity-0"
          style={{ width: "20px", height: "20px" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: "2px", top: "2px", width: "16px", height: "16px", backgroundColor: FIELD_BORDER, borderRadius: "4px" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{ left: "3.5px", top: "3.5px", width: "13px", height: "13px", backgroundColor: "var(--tott-home-surface)", borderRadius: "2.5px" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute opacity-0 peer-checked:opacity-100"
          style={{ left: "4px", top: "4px", width: "12px", height: "12px", color: ACCENT }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </span>
      <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: LABEL_COLOR }}>
        {label}
      </span>
    </label>
  );
}

function FileField({
  field,
  files,
  onFilesChange,
}: {
  field: ApplicationFormField & { type: "file_multiple" };
  files: UploadedFile[];
  onFilesChange: (next: UploadedFile[]) => void;
}) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        sizeLabel: formatFileSize(file.size),
      }));
      onFilesChange([...files, ...newFiles].slice(0, field.max_files));
    },
    [field.max_files, files, onFilesChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange],
  );

  const inputId = `file-${field.name}`;
  const typesUpper = field.allowed_types.join(", ").toUpperCase();

  return (
    <div className="flex w-full flex-col" style={{ gap: "8px" }}>
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: LABEL_COLOR,
        }}
      >
        {label}
      </span>

      <div
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        className="flex flex-col items-center justify-center transition-colors"
        style={{
          padding: "24px",
          gap: "8px",
          backgroundColor: FIELD_BG,
          border: `1px dashed ${isDragging ? ACCENT : FIELD_BORDER}`,
          borderRadius: `${FIELD_RADIUS}px`,
        }}
      >
        <input
          type="file"
          multiple
          className="hidden"
          id={inputId}
          accept={field.allowed_types.map((ty) => `.${ty}`).join(",")}
          onChange={(e) => addFiles(e.target.files)}
        />
        <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center" style={{ gap: "4px" }}>
          <span style={{ color: HELPER_COLOR }}>
            <CloudUploadIcon />
          </span>
          <span
            style={{ fontFamily: SANS, fontWeight: 500, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: LABEL_COLOR, textAlign: "center" }}
          >
            {t("dynamic.fileDragBrowse")}
          </span>
          <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: HELPER_COLOR, textAlign: "center" }}>
            {t("dynamic.fileTypesLine", {
              types: typesUpper,
              maxFiles: field.max_files,
              maxSizeMb: field.max_size_mb,
            })}
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col" style={{ gap: "8px", marginTop: "8px" }}>
          {files.map(({ id, file, sizeLabel }) => (
            <li
              key={id}
              className="flex flex-row items-center"
              style={{
                padding: "12px",
                gap: "12px",
                backgroundColor: FIELD_BG,
                border: `1px solid ${FIELD_BORDER}`,
                borderRadius: `${FIELD_RADIUS}px`,
              }}
            >
              <span
                className="flex shrink-0 items-center justify-center"
                style={{ width: "40px", height: "40px", border: `1px solid ${FIELD_BORDER}`, borderRadius: "4px", color: HELPER_COLOR }}
              >
                <FileTextIcon />
              </span>
              <span className="flex min-w-0 flex-1 flex-col" style={{ gap: "4px" }}>
                <span
                  className="truncate"
                  style={{ fontFamily: SANS, fontWeight: 500, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "rgba(255,255,255,0.72)" }}
                >
                  {file.name}
                </span>
                <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "rgba(255,255,255,0.48)" }}>
                  {sizeLabel}
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeFile(id)}
                className="shrink-0 transition-opacity hover:opacity-70 focus:outline-none"
                style={{ padding: "4px", borderRadius: "6px", color: HELPER_COLOR }}
                aria-label={t("dynamic.removeFileAria")}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type DynamicOpenCallFormProps = {
  fields: ApplicationFormField[];
  /** Open call ID to submit the application to. When omitted, the form is preview-only (no POST). */
  openCallId?: string;
  submitLabel?: string;
  showHomeLink?: boolean;
  beforeSubmitSlot?: ReactNode;
  afterSubmitSlot?: ReactNode;
};

/** The checkbox field representing terms agreement (sent separately from `answers`). */
const TERMS_FIELD_NAME = "terms_agreement";

export function DynamicOpenCallForm({
  fields,
  openCallId,
  submitLabel,
  showHomeLink = true,
  beforeSubmitSlot,
  afterSubmitSlot,
}: DynamicOpenCallFormProps) {
  const t = useTranslations("Dashboard.applicationForm");
  const resolvedSubmit = submitLabel ?? t("dynamic.submit");
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [filesByField, setFilesByField] = useState<Record<string, UploadedFile[]>>({});

  const apply = useApplyToOpenCall(openCallId ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allRequiredCheckboxesChecked = fields
    .filter((f) => f.type === "checkbox" && f.required)
    .every((f) => checkboxes[f.name]);

  const setFieldFiles = useCallback((name: string, next: UploadedFile[]) => {
    setFilesByField((prev) => ({ ...prev, [name]: next }));
  }, []);

  function translateError(e: unknown): string {
    if (isAxiosError(e)) {
      const d = e.response?.data;
      if (typeof d === "string" && d.trim()) return d;
      if (d && typeof d === "object") {
        const o = d as Record<string, unknown>;
        if (typeof o.message === "string") return o.message;
        if (Array.isArray(o.message)) return o.message.map(String).join("; ");
        if (typeof o.error === "string") return o.error;
      }
    }
    return t("dynamic.errorGeneric");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!openCallId || apply.isPending) return;
    setErrorMessage(null);

    // Collect text/email/phone/textarea/select answers from the native inputs by `name`.
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    const answers: Record<string, string> = {};
    for (const field of fields) {
      if (field.type === "file_multiple" || field.name === TERMS_FIELD_NAME) continue;
      if (field.type === "checkbox") {
        answers[field.name] = checkboxes[field.name] ? "true" : "false";
        continue;
      }
      const v = fd.get(field.name);
      answers[field.name] = typeof v === "string" ? v : "";
    }

    const files = Object.values(filesByField).flatMap((list) => list.map((u) => u.file));

    try {
      await apply.mutateAsync({
        answers,
        termsAgreement: !!checkboxes[TERMS_FIELD_NAME],
        files,
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(translateError(err));
    }
  }

  if (submitted) {
    return (
      <div className="w-full space-y-2 text-center">
        <h3 className="text-lg font-semibold" style={{ color: LABEL_COLOR }}>
          {t("dynamic.successTitle")}
        </h3>
        <p className="text-sm" style={{ color: HELPER_COLOR }}>
          {t("dynamic.successBody")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full select-none flex-col items-stretch"
      style={{ gap: "24px" }}
    >
      {fields.map((field, i) => {
        if (field.type === "text" || field.type === "email" || field.type === "phone") {
          return <TextField key={i} field={field} />;
        }
        if (field.type === "textarea") {
          return <TextareaField key={i} field={field} />;
        }
        if (field.type === "select") {
          return <SelectField key={i} field={field} />;
        }
        if (field.type === "checkbox") {
          return (
            <CheckboxField
              key={i}
              field={field}
              checked={!!checkboxes[field.name]}
              onChange={(v) => setCheckboxes((prev) => ({ ...prev, [field.name]: v }))}
            />
          );
        }
        if (field.type === "file_multiple") {
          return (
            <FileField
              key={i}
              field={field}
              files={filesByField[field.name] ?? []}
              onFilesChange={(next) => setFieldFiles(field.name, next)}
            />
          );
        }
        return null;
      })}

      {beforeSubmitSlot}

      {errorMessage ? (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!allRequiredCheckboxesChecked || apply.isPending}
        className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          height: "40px",
          padding: "8px 16px",
          borderRadius: `${FIELD_RADIUS}px`,
          backgroundColor: ACCENT,
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: ACCENT_TEXT,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          textAlign: "center",
          border: "none",
        }}
      >
        {apply.isPending ? t("dynamic.submitting") : resolvedSubmit}
      </button>

      {afterSubmitSlot}

      {showHomeLink ? (
        <div className="flex flex-row items-end justify-center" style={{ gap: "4px" }}>
          <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: HELPER_COLOR }}>
            {t("dynamic.homeBack")}
          </span>
          <Link
            href="/"
            className="hover:underline"
            style={{ fontFamily: SANS, fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: ACCENT }}
          >
            {t("dynamic.homePage")}
          </Link>
        </div>
      ) : null}
    </form>
  );
}
