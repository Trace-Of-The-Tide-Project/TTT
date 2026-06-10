"use client";

import { useId, useRef, useState } from "react";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";

/** Drag-and-drop + click-to-upload zone for the writer avatar.
 * `value` is the persisted ref (relative storage key or absolute URL). */
export function AvatarUploadZone({
  value,
  uploading,
  onChange,
  labels,
}: {
  value: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labels: { uploading: string; click: string; hint: string };
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dragProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file || !inputRef.current) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    },
  };

  if (value && !uploading) {
    return (
      <div className="relative mt-1 inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary ref */}
        <img
          src={resolveArticleMediaSrc(value)}
          alt="Avatar preview"
          className="h-24 w-24 rounded-full object-cover border border-[var(--tott-card-border)] shadow-md"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <label
          htmlFor={id}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium text-white text-center px-2"
        >
          Change
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </label>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      {...dragProps}
      className={[
        "mt-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[120px]",
        dragging
          ? "border-[var(--tott-gold)] bg-[var(--tott-gold)]/5"
          : "border-[var(--tott-card-border)] hover:border-[var(--tott-gold)]/50 bg-[var(--tott-dash-input-bg)]",
      ].join(" ")}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        disabled={uploading}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-gold)]" />
          <span className="text-xs text-gray-400">{labels.uploading}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-6 px-4 text-center pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs font-medium text-gray-300 mt-1">{labels.click}</span>
          <span className="text-[10px] text-gray-500">{labels.hint}</span>
        </div>
      )}
    </label>
  );
}

/** Chip input: Enter or comma adds a theme, click × removes. */
export function ThemesInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string[];
  onChange: (themes: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const addDraft = () => {
    const item = draft.trim();
    if (!item) return;
    if (!value.some((v) => v.toLowerCase() === item.toLowerCase())) {
      onChange([...value, item]);
    }
    setDraft("");
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((theme) => (
            <span
              key={theme}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--tott-elevated)] px-2.5 py-1 text-xs text-foreground"
            >
              {theme}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value.filter((v) => v !== theme))}
                className="text-gray-400 hover:text-red-400 disabled:opacity-40"
                aria-label={`Remove ${theme}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addDraft();
          }
        }}
        onBlur={addDraft}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-[var(--tott-gold)]/60 transition-colors"
      />
    </div>
  );
}
