import { getTranslations } from "next-intl/server";
import { theme } from "@/lib/theme";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";

type SearchParams = { email?: string };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("Auth");
  const { email } = await searchParams;
  const safeEmail = typeof email === "string" ? email : "";

  return (
    <AuthPageShell
      title={t("pages.checkEmail.title")}
      subtitle={t("pages.checkEmail.intro")}
      footer={<AuthFooterLinks />}
    >
      <AuthHexFrame>
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.accentGold}33` }}
            aria-hidden
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={theme.accentGold}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            {t("pages.checkEmail.cardTitle")}
          </h2>
          <p className="mb-3 max-w-sm text-sm leading-relaxed text-[color:var(--tott-auth-subtitle)]">
            {t("pages.checkEmail.cardBody")}
          </p>
          {safeEmail ? (
            <p className="mb-2 max-w-sm break-all text-xs text-[color:var(--tott-auth-input-placeholder)]">
              {t("pages.checkEmail.sentTo", { email: safeEmail })}
            </p>
          ) : null}
          <p className="max-w-sm text-xs text-[color:var(--tott-auth-input-placeholder)]">
            {t("pages.checkEmail.spamHint")}
          </p>
        </div>
        <AuthInlineLink
          text={t("pages.checkEmail.wrongAddress")}
          href="/auth/register"
          label={t("pages.checkEmail.signUpAgain")}
          className="mt-4"
        />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
