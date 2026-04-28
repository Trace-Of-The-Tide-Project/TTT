type Tone = "error" | "success";

type AuthFormBannerProps = {
  tone?: Tone;
  children: React.ReactNode;
};

const TONES: Record<Tone, string> = {
  error: "border-red-400/30 bg-red-400/10 text-red-400",
  success: "border-green-400/30 bg-green-400/10 text-green-400",
};

/**
 * Inline status banner for auth forms (e.g. validation errors, "account
 * created" success notice). Announced via `role`, so screen readers pick up
 * dynamic changes.
 */
export function AuthFormBanner({ tone = "error", children }: AuthFormBannerProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      data-auth-banner={tone}
      className={`rounded-md border px-3 py-2 text-sm ${TONES[tone]}`}
    >
      {children}
    </p>
  );
}
