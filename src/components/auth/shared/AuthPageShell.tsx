import { AuthHexBand } from "./AuthHexBand";
import { BrandLogo } from "@/components/brand/BrandLogo";

type AuthPageShellProps = {
  /** Page heading rendered under the logo. */
  title: string;
  /** Optional muted text shown below the title. */
  subtitle?: string;
  /** Form / card area. */
  children: React.ReactNode;
  /** Optional footer slot rendered below the card (e.g. "already have an account?"). */
  footer?: React.ReactNode;
  /** Tailwind max-width class for the inner column. */
  maxWidthClass?: string;
};

/**
 * Shared layout for every auth page. Renders the gold hex band, brand mark,
 * a centred title/subtitle, the form area, and an optional footer.
 *
 * Use this for register, login, forgot-password, reset-password, verify-email,
 * check-email, and post-success flows.
 */
export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  maxWidthClass = "max-w-3xl",
}: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--background)]">
      <AuthHexBand />
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-40 pb-16 sm:pt-48">
        <div className={`flex w-full flex-col items-center ${maxWidthClass}`}>
          <BrandLogo width={57} priority />
          <h1 className="mt-8 text-center text-xl font-semibold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-neutral-400">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-10 w-full">{children}</div>
          {footer ? <div className="mt-2 w-full">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
