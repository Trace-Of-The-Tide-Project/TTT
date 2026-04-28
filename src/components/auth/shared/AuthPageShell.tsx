import { AuthHexBand } from "./AuthHexBand";
import { BrandLogo } from "@/components/brand/BrandLogo";

type AuthPageShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
};

export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  maxWidthClass = "max-w-3xl",
}: AuthPageShellProps) {
  return (
    <div className="tott-auth-page h-dvh flex flex-col overflow-hidden">
      <AuthHexBand />
      <div className="relative z-10 flex flex-1 min-h-0 flex-col items-center justify-center px-4 py-4 gap-y-2">
        <BrandLogo width={44} priority className="shrink-0 mx-auto" />
        {title ? (
          <h1 className="shrink-0 text-center text-lg font-semibold text-foreground">{title}</h1>
        ) : null}
        {subtitle ? (
          <p className="shrink-0 mx-auto max-w-sm text-center text-xs leading-relaxed text-[color:var(--tott-auth-subtitle)]">
            {subtitle}
          </p>
        ) : null}
        {title || subtitle ? (
          <div aria-hidden className="tott-auth-title-rule shrink-0" />
        ) : null}
        <div className={`flex-1 min-h-0 w-full ${maxWidthClass}`}>
          {children}
        </div>
        {footer ? <div className="shrink-0 w-full flex flex-col items-center gap-y-1">{footer}</div> : null}
      </div>
    </div>
  );
}
