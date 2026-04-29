import { AlertTriangleIcon, SquareCheckIcon } from "@/components/ui/icons";

type Tone = "error" | "success";

type AuthFormBannerProps = {
  tone?: Tone;
  children: React.ReactNode;
};

const TONE_STYLES: Record<Tone, { wrapper: React.CSSProperties; icon: string }> = {
  error: {
    wrapper: {
      backgroundColor: "#fbf1ea",
      borderColor: "#d4a896",
      color: "#7a2e1f",
      boxShadow: "var(--tott-auth-input-shadow)",
    },
    icon: "#a8533c",
  },
  success: {
    wrapper: {
      backgroundColor: "#f1f6ee",
      borderColor: "#a8c69a",
      color: "#2f5d2a",
      boxShadow: "var(--tott-auth-input-shadow)",
    },
    icon: "#5a8a4a",
  },
};

/**
 * Inline status banner for auth forms (e.g. validation errors, "account
 * created" success notice). Announced via `role`, so screen readers pick up
 * dynamic changes.
 */
export function AuthFormBanner({ tone = "error", children }: AuthFormBannerProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      data-auth-banner={tone}
      className="flex items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-sm"
      style={styles.wrapper}
    >
      <span className="shrink-0" style={{ color: styles.icon }} aria-hidden="true">
        {tone === "error" ? <AlertTriangleIcon /> : <SquareCheckIcon />}
      </span>
      <p className="leading-snug">{children}</p>
    </div>
  );
}
