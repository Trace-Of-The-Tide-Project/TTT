"use client";

import { useTranslations } from "next-intl";
import type { ApplicationFormField } from "@/services/open-calls.service";
import { CONTRIBUTION_FORM_INPUT_BASE as inputBase } from "@/lib/constants";
import {
  resolveFieldParticipantLabel,
  resolveSelectOptionLabel,
} from "@/lib/application-form-labels";

export function ApplicationFormPreview({ fields }: { fields: ApplicationFormField[] }) {
  const tApp = useTranslations("Dashboard.applicationForm");
  const tp = useTranslations("Dashboard.applicationForm.preview");

  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <h4 className="mb-4 text-sm font-semibold text-foreground">{tp("title")}</h4>
      <div className="flex flex-col gap-4">
        {fields.map((f, i) => (
          <PreviewField key={`preview-${i}`} field={f} tApp={tApp} tp={tp} />
        ))}
        <div className="pt-2 text-center">
          <span
            className="inline-block rounded-lg px-8 py-2.5 text-sm font-medium text-black"
            style={{ backgroundColor: "#C9A96E" }}
          >
            {tp("submitButton")}
          </span>
        </div>
      </div>
    </div>
  );
}

function PreviewField({
  field: f,
  tApp,
  tp,
}: {
  field: ApplicationFormField;
  tApp: ReturnType<typeof useTranslations<"Dashboard.applicationForm">>;
  tp: ReturnType<typeof useTranslations<"Dashboard.applicationForm.preview">>;
}) {
  const label = resolveFieldParticipantLabel(f, tApp);
  const req = f.required ? " *" : "";

  if (f.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
        <input type="checkbox" className="h-4 w-4 shrink-0 rounded border-gray-500 bg-[var(--tott-dash-control-bg)] accent-[#C9A96E]" />
        {label}
        {req}
      </label>
    );
  }

  if (f.type === "textarea") {
    return (
      <div>
        <p className="mb-1 text-xs text-gray-500">
          {label}
          {req}
        </p>
        <textarea
          placeholder={tp("enterField", { label })}
          className={`${inputBase} min-h-[100px] w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2.5 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500`}
        />
      </div>
    );
  }

  if (f.type === "select") {
    return (
      <div>
        <p className="mb-1 text-xs text-gray-500">
          {label}
          {req}
        </p>
        <div className="relative">
          <select
            className={`${inputBase} w-full appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2.5 pr-9 text-sm text-foreground outline-none focus:border-gray-500`}
            defaultValue=""
          >
            <option value="" disabled className="text-gray-500">
              {tp("selectPlaceholder")}
            </option>
            {f.options.map((opt, i) => (
              <option key={i} value={opt}>
                {resolveSelectOptionLabel(opt, tApp)}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    );
  }

  if (f.type === "file_multiple") {
    return (
      <div>
        <p className="mb-1 text-xs text-gray-500">
          {label}
          {req}
        </p>
        <div className="rounded-lg border border-dashed border-gray-600 bg-[var(--tott-dash-input-bg)] px-4 py-8 text-center text-xs text-gray-500">
          {tp("fileDropHint", {
            maxFiles: f.max_files,
            types: f.allowed_types.join(", "),
            maxSizeMb: f.max_size_mb,
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-1 text-xs text-gray-500">
        {label}
        {req}
      </p>
      <input
        type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
        placeholder={tp("enterField", { label })}
        className={`${inputBase} h-10 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500`}
      />
    </div>
  );
}
