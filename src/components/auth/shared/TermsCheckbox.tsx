"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthCheckbox } from "./AuthCheckbox";

type TermsCheckboxProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
};

/** "I agree to the terms and privacy policy" consent box, fully translated. */
export function TermsCheckbox({ checked, onChange, id = "terms" }: TermsCheckboxProps) {
  const t = useTranslations("Auth.forms.register");

  return (
    <AuthCheckbox id={id} checked={checked} onChange={onChange}>
      {t("termsLead")}{" "}
      <Link href="/terms" className="text-[#CBA158] hover:underline">
        {t("termsLink")}
      </Link>{" "}
      {t("termsAnd")}{" "}
      <Link href="/privacy" className="text-[#CBA158] hover:underline">
        {t("privacyLink")}
      </Link>
      {t("termsEnd")}
    </AuthCheckbox>
  );
}
