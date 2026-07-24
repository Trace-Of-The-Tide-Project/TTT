type ContentLanguageChipProps = {
  /** The card's own content language (article/piece `language` column). */
  contentLanguage?: string | null;
  /** The UI locale currently being viewed under. */
  uiLocale: string;
  /** "default" reads from the panel tokens (light/dark/tide-aware); "overlay"
   * is for chips sitting on a darkened image (matches the white-on-black
   * badges already used there, e.g. the edition label on hex cards). */
  tone?: "default" | "overlay";
  className?: string;
};

const TONE_CLASSES: Record<NonNullable<ContentLanguageChipProps["tone"]>, string> = {
  default:
    "border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] text-[var(--tott-home-text-muted)]",
  overlay: "border-white/20 bg-black/50 text-white backdrop-blur-sm",
};

/**
 * Tiny "this isn't in your language" signal for listing/feed cards — silent
 * in the common case (content matches the UI locale), visible otherwise so a
 * mismatch is obvious before the click rather than after (see
 * `ContentLanguageNotice`, its counterpart on the reader itself).
 *
 * Deliberately framework-agnostic (no hooks): several callers are async
 * server components (the magazine-next home feeds) that already have a
 * `locale` prop in scope, others are client cards with `useLocale()` —
 * either can pass `uiLocale` straight through.
 */
export function ContentLanguageChip({
  contentLanguage,
  uiLocale,
  tone = "default",
  className,
}: ContentLanguageChipProps) {
  if (!contentLanguage || contentLanguage === uiLocale) return null;
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TONE_CLASSES[tone]} ${className ?? ""}`}
    >
      {contentLanguage}
    </span>
  );
}
