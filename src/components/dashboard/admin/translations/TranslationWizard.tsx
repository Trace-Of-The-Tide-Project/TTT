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
  /** Jump directly to a step (progress-strip tab click). Form state for
   * every step already lives in the parent's `forms` map, so switching is
   * a pure read — nothing is lost. */
  onStepClick: (step: number) => void;
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
  onStepClick,
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
      {/* Numbered-circle stepper — connecting line shows overall progress,
          each node is independently clickable (state for every step already
          lives in the parent, so jumping is a pure read). */}
      <div className="flex items-center">
        {[...locales, "__review"].map((loc, i) => {
          const isLast = i === locales.length;
          const done = i < step || (isLast && isReview);
          const active = i === step;
          return (
            <div key={loc} className={isLast ? "flex items-center" : "flex flex-1 items-center"}>
              <button
                type="button"
                onClick={() => onStepClick(i)}
                disabled={busy}
                className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
                    done
                      ? "bg-[var(--tott-accent-gold)] text-black"
                      : active
                        ? "border-2 border-[var(--tott-accent-gold)] text-[var(--tott-dash-gold-text)] bg-[var(--tott-elevated)]"
                        : "border border-[var(--tott-card-border)] text-[var(--tott-muted)] bg-transparent group-hover:border-[var(--tott-muted)]"
                  }`}
                >
                  {done ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isLast ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    active ? "text-[var(--tott-dash-gold-text)]" : "text-[var(--tott-muted)]"
                  }`}
                >
                  {isLast ? t("reviewStepShort") : loc}
                </span>
              </button>
              {!isLast && (
                <div className="mx-1 h-0.5 flex-1 self-start mt-4 rounded-full overflow-hidden bg-[var(--tott-card-border)]">
                  <div
                    className={`h-full rounded-full bg-[var(--tott-accent-gold)] transition-all duration-300 ${
                      i < step ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
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
