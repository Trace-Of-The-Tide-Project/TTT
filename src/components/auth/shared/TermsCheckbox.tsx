"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type TermsCheckboxProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
};

/**
 * Register-form consent row: "I agree to the [terms] and [privacy policy]."
 * Checkbox flush left, sentence flows on the right with gold inline links.
 */
export function TermsCheckbox({ checked, onChange, id = "terms" }: TermsCheckboxProps) {
  const t = useTranslations("Auth.forms.register");

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2 text-[12px] text-foreground min-[500px]:gap-3 min-[500px]:text-sm"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-sm border border-[color:var(--tott-auth-checkbox-border)] bg-[color:var(--tott-auth-input-bg)] text-[color:var(--tott-accent-gold)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--tott-accent-gold)_40%,transparent)]"
      />
      <span className="leading-snug">
        {t("termsLead")}{" "}
        <Link
          href="/terms"
          className="text-[color:var(--tott-accent-gold)] transition-opacity hover:opacity-80"
        >
          {t("termsLink")}
        </Link>{" "}
        {t("termsAnd")}{" "}
        <Link
          href="/privacy"
          className="text-[color:var(--tott-accent-gold)] transition-opacity hover:opacity-80"
        >
          {t("privacyLink")}
        </Link>
        {t("termsEnd")}
      </span>
    </label>
  );
}
