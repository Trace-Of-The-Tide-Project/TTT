"use client";

import { useTranslations as useIntl } from "next-intl";

/**
 * Create-mode step controller for multi-language authoring.
 *
 * Pairs with the `forms`/`dirty`/`primaryLang` state every create form
 * already keeps (see WriterFormContent for the reference shape). The wizard
 * only gates *which step is visible* — it renders the form's own unchanged
 * field-section JSX (`children`) for the active locale, then a final
 * read-only review step built from `reviewLines` before the real submit
 * fires. No field markup lives here; no save/network logic lives here.
 *
 * Steps: primary locale → each other locale (fill or skip) → review.
 */
export type TranslationWizardReviewLine = {
  locale: string;
  label: string;
  /** "create" | "skip" — review-step chip on this line. */
  action: "create" | "skip";
};

type Props = {
  /** Ordered locales for the language steps, primary first. */
  locales: string[];
  /** Index into `locales` for the active language step; `locales.length` = review step. */
  step: number;
  /** Per-locale label shown in the progress strip (e.g. "English", "Arabic"). */
  localeLabel: (locale: string) => string;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onConfirm: () => void;
  /** Disables all navigation (submit in flight). */
  busy?: boolean;
  /** Current language step's field section(s) — untouched form JSX. */
  children: React.ReactNode;
  /** Review-step content — one line per locale, primary always "create". */
  reviewLines: TranslationWizardReviewLine[];
};

export function TranslationWizard({
  locales,
  step,
  localeLabel,
  onBack,
  onSkip,
  onNext,
  onConfirm,
  busy,
  children,
  reviewLines,
}: Props) {
  const t = useIntl("Dashboard.translations.wizard");
  const isReview = step >= locales.length;
  const isPrimary = step === 0;
  const currentLocale = locales[step];

  return (
    <div className="space-y-5">
      {/* Progress strip — each segment labeled with its locale code so the
          admin can see what's ahead, not just how far along they are. */}
      <div className="flex items-center gap-1.5">
        {locales.map((loc, i) => (
          <div key={loc} className="flex-1 space-y-1">
            <div
              className={`rounded-full h-1 transition-colors ${
                i < step || isReview
                  ? "bg-[var(--tott-accent-gold)]"
                  : i === step
                    ? "bg-[var(--tott-accent-gold)]/50"
                    : "bg-[var(--tott-card-border)]"
              }`}
            />
            <p
              className={`text-center text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                i === step && !isReview
                  ? "text-[var(--tott-dash-gold-text)]"
                  : "text-[var(--tott-muted)]"
              }`}
            >
              {loc}
            </p>
          </div>
        ))}
        <div className="flex-1 space-y-1">
          <div
            className={`rounded-full h-1 transition-colors ${
              isReview ? "bg-[var(--tott-accent-gold)]" : "bg-[var(--tott-card-border)]"
            }`}
          />
          <p
            className={`text-center text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              isReview ? "text-[var(--tott-dash-gold-text)]" : "text-[var(--tott-muted)]"
            }`}
          >
            {t("reviewStepShort")}
          </p>
        </div>
      </div>

      {/* Prominent current-step heading — not a small caption easy to miss. */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {isReview ? t("reviewStep") : localeLabel(currentLocale)}
        </h2>
        <p className="text-xs text-[var(--tott-muted)]">
          {isReview
            ? null
            : t("step", { current: step + 1, total: locales.length })}
        </p>
      </div>

      {/* Non-primary steps start as a clone of the primary tab's text — make
          that explicit, otherwise it silently reads as "nothing happened". */}
      {!isReview && !isPrimary ? (
        <div className="rounded-lg border border-[var(--tott-accent-gold)]/30 bg-[var(--tott-accent-gold)]/5 px-3 py-2 text-xs text-[var(--tott-dash-gold-text)]">
          {t("clonedNotice", { language: localeLabel(currentLocale) })}
        </div>
      ) : null}

      {isReview ? (
        <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-4 space-y-2">
          {reviewLines.map((line) => (
            <div key={line.locale} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{line.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  line.action === "create"
                    ? "bg-[var(--tott-accent-gold)]/15 text-[var(--tott-dash-gold-text)]"
                    : "bg-[var(--tott-card-border)]/40 text-[var(--tott-muted)]"
                }`}
              >
                {line.action === "create" ? t("willCreate") : t("willSkip")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        children
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--tott-card-border)] pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={busy || step === 0}
          className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-40 transition-colors"
        >
          {t("back")}
        </button>
        <div className="flex items-center gap-2">
          {!isPrimary && !isReview ? (
            <button
              type="button"
              onClick={onSkip}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-40 transition-colors"
            >
              {t("skipLanguage")}
            </button>
          ) : null}
          {isReview ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-accent-gold)]/60 bg-[var(--tott-accent-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/20 disabled:opacity-40 transition-colors"
            >
              {busy && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {t("confirmSave")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={busy}
              className="rounded-lg border border-[var(--tott-accent-gold)]/60 bg-[var(--tott-accent-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/20 disabled:opacity-40 transition-colors"
            >
              {t("next")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
