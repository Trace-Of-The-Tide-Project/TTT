"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  PersonIcon,
  EmailIcon,
  CloudUploadIcon,
  ChevronDownIcon,
  FileTextIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { CONTRIBUTION_FORM_INPUT_BASE as inputBase } from "@/lib/constants";
import type { ApplicationFormField } from "@/services/open-calls.service";
import {
  resolveFieldParticipantLabel,
  resolveSelectOptionLabel,
} from "@/lib/application-form-labels";

type UploadedFile = { id: string; file: File; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconForType(type: ApplicationFormField["type"]) {
  switch (type) {
    case "email":
      return <EmailIcon />;
    case "phone":
      return (
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    default:
      return <PersonIcon />;
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
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">
        {label}
        {field.required && <span className="ml-0.5 text-[#C9A96E]">*</span>}
      </label>
      <div
        className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
        style={{ borderColor: theme.inputBorder, backgroundColor: theme.panelWellBackground }}
      >
        <span className="shrink-0 text-gray-500">{iconForType(field.type)}</span>
        <input
          name={field.name}
          type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
          placeholder={t("dynamic.enterField", { label })}
          required={field.required}
          className="w-full bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
        />
      </div>
    </div>
  );
}

function TextareaField({ field }: { field: ApplicationFormField & { type: "textarea" } }) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">
        {label}
        {field.required && <span className="ml-0.5 text-[#C9A96E]">*</span>}
      </label>
      <textarea
        name={field.name}
        rows={4}
        placeholder={t("dynamic.enterField", { label })}
        required={field.required}
        className={inputBase}
        style={{ borderColor: theme.inputBorder }}
      />
    </div>
  );
}

function SelectField({ field }: { field: ApplicationFormField & { type: "select" } }) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">
        {label}
        {field.required && <span className="ml-0.5 text-[#C9A96E]">*</span>}
      </label>
      <div
        className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
        style={{ borderColor: theme.inputBorder, backgroundColor: theme.panelWellBackground }}
      >
        <select
          name={field.name}
          required={field.required}
          className="w-full appearance-none bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
        >
          <option value="" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
            {t("dynamic.selectPlaceholder")}
          </option>
          {field.options.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]"
            >
              {resolveSelectOptionLabel(opt, t)}
            </option>
          ))}
        </select>
        <span className="pointer-events-none shrink-0 text-gray-500">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
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
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        name={field.name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={field.required}
        className="h-4 w-4 rounded border-gray-600 bg-transparent accent-[#C9A96E] focus:ring-[#C9A96E]"
      />
      <span className="text-sm text-gray-500">{label}</span>
    </label>
  );
}

function FileField({ field }: { field: ApplicationFormField & { type: "file_multiple" } }) {
  const t = useTranslations("Dashboard.applicationForm");
  const label = resolveFieldParticipantLabel(field, t);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        sizeLabel: formatFileSize(file.size),
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, field.max_files));
    },
    [field.max_files],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const inputId = `file-${field.name}`;
  const typesUpper = field.allowed_types.join(", ").toUpperCase();

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">
        {label}
        {field.required && <span className="ml-0.5 text-[#C9A96E]">*</span>}
      </label>
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
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
          isDragging ? "border-[#C9A96E] bg-[#C9A96E]/10" : "border-gray-600 bg-[var(--tott-well-bg)]"
        }`}
      >
        <input
          type="file"
          multiple
          className="hidden"
          id={inputId}
          accept={field.allowed_types.map((ty) => `.${ty}`).join(",")}
          onChange={(e) => addFiles(e.target.files)}
        />
        <label
          htmlFor={inputId}
          className="flex cursor-pointer flex-col items-center gap-2 text-gray-400"
        >
          <span style={{ color: theme.accentGoldFocus }}>
            <CloudUploadIcon />
          </span>
          <span className="text-center text-sm">{t("dynamic.fileDragBrowse")}</span>
          <span className="text-xs text-gray-500">
            {t("dynamic.fileTypesLine", {
              types: typesUpper,
              maxFiles: field.max_files,
              maxSizeMb: field.max_size_mb,
            })}
          </span>
        </label>
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map(({ id, file, sizeLabel }) => (
            <li
              key={id}
              className="flex items-center gap-3 rounded-lg border border-gray-700 px-4 py-3"
              style={{ backgroundColor: theme.panelWellBackground }}
            >
              <span className="text-gray-500">
                <FileTextIcon />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-[color:var(--tott-panel-text)]">
                {file.name}
              </span>
              <span className="text-xs text-gray-500">{sizeLabel}</span>
              <button
                type="button"
                onClick={() => removeFile(id)}
                className="rounded p-1 text-gray-500 hover:bg-black/10 hover:text-[color:var(--tott-panel-text)]"
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
  submitLabel?: string;
  showHomeLink?: boolean;
  beforeSubmitSlot?: ReactNode;
  afterSubmitSlot?: ReactNode;
};

export function DynamicOpenCallForm({
  fields,
  submitLabel,
  showHomeLink = true,
  beforeSubmitSlot,
  afterSubmitSlot,
}: DynamicOpenCallFormProps) {
  const t = useTranslations("Dashboard.applicationForm");
  const resolvedSubmit = submitLabel ?? t("dynamic.submit");
  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});

  const allRequiredCheckboxesChecked = fields
    .filter((f) => f.type === "checkbox" && f.required)
    .every((f) => checkboxes[f.name]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full select-none space-y-5">
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
          return <FileField key={i} field={field} />;
        }
        return null;
      })}

      {beforeSubmitSlot}

      <button
        type="submit"
        disabled={!allRequiredCheckboxesChecked}
        className="w-full cursor-pointer rounded-lg py-3.5 text-base font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        style={{
          backgroundColor: theme.accentGold,
          boxShadow: `0 0 0 1px ${theme.accentGold}`,
          color: theme.bgDark,
        }}
      >
        {resolvedSubmit}
      </button>

      {afterSubmitSlot}

      {showHomeLink ? (
        <p className="text-center text-sm text-gray-400">
          {t("dynamic.homeBack")}{" "}
          <Link href="/" className="hover:underline" style={{ color: theme.accentGold }}>
            {t("dynamic.homePage")}
          </Link>
        </p>
      ) : null}
    </form>
  );
}
