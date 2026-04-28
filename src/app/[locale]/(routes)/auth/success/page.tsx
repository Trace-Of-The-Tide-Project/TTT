import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { HeadsetIcon } from "@/components/ui/icons";
import {
  AuthHexFrame,
  AuthPageShell,
  AuthSubmitButton,
} from "@/components/auth/shared";

export default async function SuccessPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell title={t("pages.success.title")} subtitle={t("pages.success.subtitle")}>
      <AuthHexFrame>
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
            aria-hidden
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <Link href="/auth/login" className="block w-full">
            <AuthSubmitButton type="button">{t("pages.success.cta")}</AuthSubmitButton>
          </Link>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-1.5 text-sm text-[color:var(--tott-auth-footer-muted)]">
            {t("pages.success.supportLead")}
            <span style={{ color: theme.accentGold }} aria-hidden>
              <HeadsetIcon />
            </span>
            <Link
              href="/contact"
              className="inline-flex hover:underline"
              style={{ color: theme.accentGold }}
            >
              {t("pages.success.contactUs")}
            </Link>
          </p>
        </div>
      </AuthHexFrame>
    </AuthPageShell>
  );
}
