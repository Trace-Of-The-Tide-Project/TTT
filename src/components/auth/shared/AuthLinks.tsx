"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

type AuthLinksProps = {
  /** Primary CTA text, e.g. "Already have an account? " */
  primaryText: React.ReactNode;
  primaryHref: string;
  primaryLinkLabel: string;
  /** Secondary link, e.g. home */
  backHref?: string;
  backLabel?: string;
};

export function AuthLinks({
  primaryText,
  primaryHref,
  primaryLinkLabel,
  backHref = "/",
  backLabel,
}: AuthLinksProps) {
  const t = useTranslations("Auth.shared");
  const home = backLabel ?? t("homePage");

  return (
    <>
      <p className="mt-6 cursor-default select-none text-center text-sm text-foreground">
        {primaryText ? (
          <>
            {primaryText}
            {" "}
          </>
        ) : null}
        <Link href={primaryHref} className="cursor-pointer hover:underline" style={{ color: theme.accentGold }}>
          {primaryLinkLabel}
        </Link>
      </p>
      <div className="mt-6 text-center">
        <span className="cursor-default select-none text-sm text-foreground">{t("backToPrefix")}</span>
        <Link href={backHref} className="cursor-pointer text-sm hover:underline" style={{ color: theme.accentGold }}>
          {home}
        </Link>
      </div>
    </>
  );
}
