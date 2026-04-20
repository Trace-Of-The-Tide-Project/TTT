"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon, XIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

export type MessageTemplateCategory = "onboarding" | "payment" | "moderation" | "broadcast" | "support";

export type MessageTemplate = {
  id: string;
  name: string;
  category: MessageTemplateCategory;
  subject: string;
  body: string;
};

type CreateMessageTemplateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (template: Omit<MessageTemplate, "id">) => void;
};

const TEMPLATE_CATEGORY_VALUES: MessageTemplateCategory[] = [
  "onboarding",
  "payment",
  "moderation",
  "broadcast",
  "support",
];

export function CreateMessageTemplateModal({ open, onClose, onCreate }: CreateMessageTemplateModalProps) {
  const tc = useTranslations("Dashboard.messagingCreateTemplateModal");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MessageTemplateCategory>("onboarding");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const canSubmit = useMemo(() => name.trim().length > 0 && subject.trim().length > 0 && body.trim().length > 0, [
    name,
    subject,
    body,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
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

  useEffect(() => {
    if (!open) return;
    setName("");
    setCategory("onboarding");
    setCategoryOpen(false);
    setSubject("");
    setBody("");
  }, [open]);

  useEffect(() => {
    if (!open || !categoryOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(target)
      ) {
        setCategoryOpen(false);
      }
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setCategoryOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open, categoryOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={tc("closeModalAria")}
      />

      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">{tc("title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tc("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label={tc("closeAria")}
          >
            <XIcon />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onCreate({
              name: name.trim(),
              category,
              subject: subject.trim(),
              body: body.trim(),
            });
            onClose();
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{tc("nameLabel")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tc("namePlaceholder")}
              className="h-[44px] w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 text-sm text-foreground placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{tc("categoryLabel")}</label>
            <div className="relative">
              <button
                ref={categoryButtonRef}
                type="button"
                onClick={() => setCategoryOpen((v) => !v)}
                className="flex h-[44px] w-full items-center justify-between rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 text-sm text-foreground outline-none transition-colors focus:border-gray-500"
                aria-haspopup="listbox"
                aria-expanded={categoryOpen}
              >
                <span className="text-gray-200">{(tc as (key: string) => string)(`categories.${category}`)}</span>
                <span className="text-gray-500">
                  <ChevronDownIcon />
                </span>
              </button>

              {categoryOpen && (
                <div
                  ref={categoryMenuRef}
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-2 shadow-xl"
                >
                  {TEMPLATE_CATEGORY_VALUES.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setCategory(opt);
                        setCategoryOpen(false);
                      }}
                      className="w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-ghost-hover)]"
                    >
                      {(tc as (key: string) => string)(`categories.${opt}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{tc("subjectLabel")}</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={tc("subjectPlaceholder")}
              className="h-[44px] w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 text-sm text-foreground placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{tc("bodyLabel")}</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={tc("bodyPlaceholder")}
              rows={5}
              className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-3 text-sm text-foreground placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
            />
            <p className="mt-2 text-xs text-gray-500">
              {tc("variablesHint")}{" "}
              <span className="text-gray-400">{tc("variablesList")}</span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-foreground"
            >
              {tc("cancel")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg px-6 py-2 text-sm font-medium text-black transition-colors disabled:opacity-50"
              style={{ backgroundColor: theme.accentGoldFocus }}
            >
              {tc("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

