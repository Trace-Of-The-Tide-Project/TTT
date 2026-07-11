"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { settingsCardClass } from "../SettingsPrimitives";
import { useAvailability } from "@/hooks/queries/availability";
import { useUpdateAvailability } from "@/hooks/mutations/availability";
import { accountErrorMessage } from "@/services/account.service";
import type {
  AvailabilityData,
  AvailabilityStatus,
} from "@/services/availability.service";

type SaveState = "idle" | "saving" | "saved" | "error";

const STATUS_OPTIONS: { value: AvailabilityStatus; dotColor: string }[] = [
  { value: "available", dotColor: "var(--tott-dash-positive)" },
  { value: "busy", dotColor: "var(--tott-status-amber)" },
  { value: "away", dotColor: "var(--tott-muted)" },
];

const textareaClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]";

function StatusCard({
  selected,
  dotColor,
  label,
  description,
  onSelect,
  ariaLabel,
}: {
  selected: boolean;
  dotColor: string;
  label: string;
  description: string;
  onSelect: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onSelect}
      className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tott-accent-gold)] ${
        selected
          ? "border-[var(--tott-accent-gold)] bg-[var(--tott-accent-gold)]/10"
          : "border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] hover:border-[var(--tott-accent-gold)]/50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden
        />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </span>
      <span className="text-xs text-[var(--tott-muted)]">{description}</span>
    </button>
  );
}

export function AvailabilitySettings() {
  const t = useTranslations("Dashboard.availability");
  const { data, isPending, isError } = useAvailability();
  const updateMutation = useUpdateAvailability();

  const [status, setStatus] = useState<AvailabilityStatus>("available");
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed local state from the server response (render-phase prev-value pattern).
  const [prev, setPrev] = useState<AvailabilityData | undefined>(undefined);
  if (data && data !== prev) {
    setPrev(data);
    setStatus(data.status);
    setMessage(data.message);
  }

  const labelFor = (s: AvailabilityStatus) =>
    s === "available"
      ? t("statusAvailable")
      : s === "busy"
        ? t("statusBusy")
        : t("statusAway");
  const descFor = (s: AvailabilityStatus) =>
    s === "available"
      ? t("statusAvailableDescription")
      : s === "busy"
        ? t("statusBusyDescription")
        : t("statusAwayDescription");

  const handleSave = useCallback(() => {
    setSaveState("saving");
    setSaveError(null);
    updateMutation.mutate(
      { status, message },
      {
        onSuccess: () => {
          setSaveState("saved");
          window.setTimeout(() => setSaveState("idle"), 2000);
        },
        onError: (e) => {
          setSaveError(accountErrorMessage(e, t("saveError")));
          setSaveState("error");
          window.setTimeout(() => setSaveState("idle"), 4000);
        },
      },
    );
  }, [status, message, updateMutation, t]);

  const saveLabel =
    saveState === "saving" ? t("saving") : saveState === "saved" ? t("saved") : t("save");

  return (
    <div className="mx-auto max-w-3xl">
      <div className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
        <div className="mb-2">
          <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
        </div>

        {isPending ? (
          <p className="mt-6 text-sm text-[var(--tott-muted)]">{t("loading")}</p>
        ) : isError ? (
          <p className="mt-6 text-sm text-[var(--tott-dash-negative)]" role="alert">
            {t("loadError")}
          </p>
        ) : null}

        <div className="mt-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--tott-muted)]">
            {t("statusLabel")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t("statusAria")}>
            {STATUS_OPTIONS.map((opt) => (
              <StatusCard
                key={opt.value}
                selected={status === opt.value}
                dotColor={opt.dotColor}
                label={labelFor(opt.value)}
                description={descFor(opt.value)}
                ariaLabel={labelFor(opt.value)}
                onSelect={() => setStatus(opt.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label htmlFor="availability-message" className="mb-1.5 block text-xs text-[var(--tott-muted)]">
            {t("messageLabel")}
          </label>
          <textarea
            id="availability-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("messagePlaceholder")}
            rows={3}
            className={textareaClass}
          />
          <p className="mt-1.5 text-xs text-[var(--tott-muted)]">{t("messageHint")}</p>
        </div>

        {saveError ? (
          <p className="mt-6 text-sm text-[var(--tott-dash-negative)]" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || saveState === "saving"}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: saveState === "error" ? "#ef4444" : theme.accentGold }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
