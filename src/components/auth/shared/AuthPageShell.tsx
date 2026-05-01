import { AuthHexBand } from "./AuthHexBand";
import { BrandLogo } from "@/components/brand/BrandLogo";

type AuthPageShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
};

/**
 * Auth page layout. The page is `min-h-dvh` and content scrolls naturally if
 * it exceeds the viewport — fighting the viewport with `overflow-hidden` was
 * what caused the hex to distort on shorter screens. On tall viewports the
 * column is vertically centered; on short viewports it scrolls.
 */
export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  maxWidthClass = "max-w-3xl",
}: AuthPageShellProps) {
  return (
    <div className="tott-auth-page relative flex min-h-dvh flex-col">
      <AuthHexBand />
      <div className="relative z-10 mx-auto flex w-full flex-1 flex-col items-center justify-center gap-3 px-4 py-6 sm:gap-4 sm:px-6 sm:py-8 md:gap-5 md:py-10">
        <BrandLogo width={44} priority className="shrink-0" />
        {title ? (
          <h1 className="shrink-0 text-center text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="shrink-0 mx-auto max-w-md text-center text-xs leading-relaxed text-[color:var(--tott-auth-subtitle)] sm:text-sm">
            {subtitle}
          </p>
        ) : null}
        {title || subtitle ? (
          <div aria-hidden className="tott-auth-title-rule shrink-0" />
        ) : null}
        <div className={`w-full ${maxWidthClass}`}>{children}</div>
        {footer ? (
          <div className="shrink-0 flex w-full flex-col items-center gap-y-1">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
