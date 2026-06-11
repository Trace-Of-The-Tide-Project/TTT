"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type AuthFooterLinksProps = {
  /** Override the destination of the back link. Pass null to omit the line. */
  backHref?: string | null;
  /** Override the label of the back link. Defaults to the translated home label. */
  backLabel?: string;
  className?: string;
};

/**
 * Page-level footer beneath an auth card. Currently renders the
 * "Back to Home page" line. Inline prompts like
 * "Already have an account? Login" should live inside the hex frame
 * via `AuthInlineLink`.
 */
export function AuthFooterLinks({
  backHref = "/",
  backLabel,
  className,
}: AuthFooterLinksProps) {
  const t = useTranslations("Auth.shared");

  if (!backHref) return null;
  const home = backLabel ?? t("homePage");

  return (
    <div className={`text-center ${className ?? ""}`}>
      <p className="text-sm text-[color:var(--tott-auth-footer-muted)]">
        {t("backToPrefix")}
        <Link href={backHref} className="cursor-pointer text-[color:var(--tott-accent-gold)] hover:underline">
          {home}
        </Link>
      </p>
    </div>
  );
}
