"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ApplicationFormField } from "@/services/open-calls.service";
import { resolveApplicationFieldLabel } from "@/lib/application-form-labels";
import { DEFAULT_OPEN_CALL_APPLICATION_FIELDS } from "@/services/open-calls.service";
import { GripIcon } from "../ArticleEditorIcons";
import { ApplicationFormPreview } from "./ApplicationFormPreview";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";

const FIELD_DRAG_MIME = "application/x-tott-field-index";

type Props = {
  fields: ApplicationFormField[];
  onChange: (fields: ApplicationFormField[]) => void;
  /** When set, “Reset to default template” restores this list instead of the open-call template. */
  defaultTemplateFields?: ApplicationFormField[];
};

function newFieldForType(type: ApplicationFormField["type"]): ApplicationFormField {
  const base = { name: `field_${Date.now()}`, required: false } as const;
  switch (type) {
    case "text":
      return { ...base, type: "text", required: true };
    case "email":
      return { ...base, type: "email", required: true };
    case "phone":
      return { ...base, type: "phone", required: true };
    case "textarea":
      return { ...base, type: "textarea", required: true };
    case "checkbox":
      return { ...base, type: "checkbox", required: true };
    case "select":
      return { ...base, type: "select", required: true, options: ["Option A", "Option B"] };
    case "file_multiple":
      return {
        ...base,
        type: "file_multiple",
        required: false,
        max_files: 5,
        allowed_types: ["jpg", "png", "pdf"],
        max_size_mb: 20,
      };
    default:
      return { ...base, type: "text", required: true };
  }
}

export function ApplicationFormBuilder({ fields, onChange, defaultTemplateFields }: Props) {
  const tb = useTranslations("Dashboard.applicationForm.builder");
  const [showPreview, setShowPreview] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const next = [...fields];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item!);
      onChange(next);
    },
    [fields, onChange],
  );

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData(FIELD_DRAG_MIME, String(index));
    e.dataTransfer.effectAllowed = "move";
    setDraggingIdx(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!e.dataTransfer.types.includes(FIELD_DRAG_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(index);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = Number(e.dataTransfer.getData(FIELD_DRAG_MIME));
      if (!Number.isNaN(fromIndex)) reorder(fromIndex, toIndex);
      setDraggingIdx(null);
      setDragOverIdx(null);
    },
    [reorder],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  }, []);

  const remove = useCallback(
    (index: number) => {
      onChange(fields.filter((_, i) => i !== index));
    },
    [fields, onChange],
  );

  const replace = useCallback(
    (index: number, field: ApplicationFormField) => {
      const next = [...fields];
      next[index] = field;
      onChange(next);
    },
    [fields, onChange],
  );

  const addField = useCallback(
    (type: ApplicationFormField["type"]) => {
      onChange([...fields, newFieldForType(type)]);
    },
    [fields, onChange],
  );

  const resetDefaults = useCallback(() => {
    const src = defaultTemplateFields ?? DEFAULT_OPEN_CALL_APPLICATION_FIELDS;
    onChange(src.map((f) => JSON.parse(JSON.stringify(f))));
  }, [onChange, defaultTemplateFields]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-foreground">{tb("title")}</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="rounded-lg border border-[#C9A96E] px-4 py-1.5 text-xs font-medium text-[#C9A96E] transition-colors hover:bg-[#C9A96E]/10"
          >
            {tb("previewForm")}
          </button>
          <button
            type="button"
            onClick={resetDefaults}
            className="text-xs font-medium text-[#C9A96E] underline hover:text-[#DBC99E]"
          >
            {tb("resetTemplate")}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <FieldRow
            key={index}
            field={field}
            index={index}
            isDragging={draggingIdx === index}
            isDragOver={dragOverIdx === index && draggingIdx !== index}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onRemove={remove}
            onReplace={replace}
          />
        ))}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-gray-500">{tb("addField")}</span>
          {(
            ["text", "email", "phone", "textarea", "select", "checkbox", "file_multiple"] as const
          ).map((fieldType) => (
            <button
              key={fieldType}
              type="button"
              onClick={() => addField(fieldType)}
              className="rounded border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-2 py-1 text-xs text-gray-300 hover:border-gray-500"
            >
              + {tb(`fieldTypeLabels.${fieldType}`)}
            </button>
          ))}
        </div>
      </div>

      {showPreview && (
        <PreviewModal fields={fields} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

function PreviewModal({
  fields,
  onClose,
}: {
  fields: ApplicationFormField[];
  onClose: () => void;
}) {
  const tb = useTranslations("Dashboard.applicationForm.builder");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-4 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{tb("previewModalTitle")}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={tb("closePreviewAria")}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <ApplicationFormPreview fields={fields} />
      </div>
    </div>
  );
}

function FieldRow({
  field,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onReplace,
}: {
  field: ApplicationFormField;
  index: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onRemove: (i: number) => void;
  onReplace: (i: number, f: ApplicationFormField) => void;
}) {
  const tb = useTranslations("Dashboard.applicationForm.builder");
  const tApp = useTranslations("Dashboard.applicationForm");
  const resolvedParticipant = useMemo(
    () => resolveApplicationFieldLabel(field.name, tApp),
    [field.name, tApp],
  );
  const [participantLabelFocused, setParticipantLabelFocused] = useState(false);
  const [participantLabelDraft, setParticipantLabelDraft] = useState("");
  const participantLabelInputValue = participantLabelFocused
    ? participantLabelDraft
    : (field.label ?? resolvedParticipant);

  const commitParticipantLabel = useCallback(() => {
    const trimmed = participantLabelDraft.trim();
    const res = resolvedParticipant.trim();
    if (!trimmed || trimmed === res) {
      const next = { ...field } as ApplicationFormField & { label?: string };
      delete next.label;
      onReplace(index, next as ApplicationFormField);
    } else {
      onReplace(index, { ...field, label: trimmed } as ApplicationFormField);
    }
  }, [field, index, participantLabelDraft, onReplace, resolvedParticipant]);

  const [localOptions, setLocalOptions] = useState(
    field.type === "select" ? field.options.join("\n") : "",
  );
  const [localAllowedTypes, setLocalAllowedTypes] = useState(
    field.type === "file_multiple" ? field.allowed_types.join(", ") : "",
  );

  const setRequired = (required: boolean) => {
    onReplace(index, { ...field, required } as ApplicationFormField);
  };

  return (
    <div
      className={`flex gap-3 rounded-lg border bg-[#141414] p-4 transition-all ${
        isDragging ? "border-[#C9A96E]/40 opacity-50" : isDragOver ? "border-[#C9A96E] bg-[var(--tott-dash-input-bg)]" : "border-[var(--tott-card-border)]"
      }`}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="flex shrink-0 items-center self-stretch">
        <div
          role="button"
          tabIndex={0}
          draggable
          aria-label={tb("dragReorderAria")}
          title={tb("dragReorderTitle")}
          onDragStart={(e) => onDragStart(e, index)}
          onDragEnd={onDragEnd}
          className={`flex h-8 w-8 cursor-grab items-center justify-center rounded border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-foreground transition-colors select-none hover:bg-[var(--tott-dash-control-hover)] active:cursor-grabbing ${
            isDragging ? "opacity-50" : ""
          }`}
        >
          <GripIcon />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-auto rounded bg-red-900/40 px-2 py-1 text-xs text-red-200 hover:bg-red-900/60"
          >
            {tb("remove")}
          </button>
        </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-gray-500">{tb("participantLabelField")}</label>
          <input
            className={inputClass}
            dir="auto"
            autoComplete="off"
            value={participantLabelInputValue}
            onFocus={() => {
              setParticipantLabelFocused(true);
              setParticipantLabelDraft(field.label ?? resolvedParticipant);
            }}
            onChange={(e) => setParticipantLabelDraft(e.target.value)}
            onBlur={() => {
              commitParticipantLabel();
              setParticipantLabelFocused(false);
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">{tb("typeLabel")}</label>
          <select
            className={inputClass}
            value={field.type}
            onChange={(e) => {
              const nextType = e.target.value as ApplicationFormField["type"];
              const nf = newFieldForType(nextType);
              onReplace(index, {
                ...nf,
                name: field.name,
                required: field.required,
                ...(field.label ? { label: field.label } : {}),
              } as ApplicationFormField);
            }}
          >
            {(["text", "email", "phone", "textarea", "select", "checkbox", "file_multiple"] as const).map(
              (ty) => (
                <option key={ty} value={ty}>
                  {tb(`fieldTypeLabels.${ty}`)}
                </option>
              ),
            )}
          </select>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => setRequired(e.target.checked)}
          className="rounded border-gray-600"
        />
        {tb("required")}
      </label>

      {field.type === "select" ? (
        <div className="mt-3">
          <label className="mb-1 block text-xs text-gray-500">{tb("optionsLabel")}</label>
          <textarea
            className={`${inputClass} min-h-[80px] font-mono text-xs`}
            value={localOptions}
            onChange={(e) => setLocalOptions(e.target.value)}
            onBlur={() => {
              const parsed = localOptions
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              const options = parsed.length > 0 ? parsed : ["Option A", "Option B"];
              if (parsed.length === 0) setLocalOptions(options.join("\n"));
              onReplace(index, { ...field, type: "select", options });
            }}
          />
        </div>
      ) : null}

      {field.type === "file_multiple" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">{tb("maxFiles")}</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={field.max_files}
              onChange={(e) =>
                onReplace(index, {
                  ...field,
                  type: "file_multiple",
                  max_files: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">{tb("maxSizeMb")}</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={field.max_size_mb}
              onChange={(e) =>
                onReplace(index, {
                  ...field,
                  type: "file_multiple",
                  max_size_mb: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
            />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs text-gray-500">{tb("allowedTypes")}</label>
            <input
              className={inputClass}
              value={localAllowedTypes}
              onChange={(e) => setLocalAllowedTypes(e.target.value)}
              onBlur={() => {
                const allowed_types = localAllowedTypes
                  .split(",")
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean);
                onReplace(index, { ...field, type: "file_multiple", allowed_types });
              }}
            />
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
