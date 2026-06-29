import { theme } from "@/lib/theme";
import { LastUpdatedIndicator } from "@/components/ui/LastUpdatedIndicator";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** When true, removes horizontal and top padding, keeps bottom padding only */
  compactPadding?: boolean;
  /** Show the green-pulse "Last updated: Just now" indicator at the right edge. */
  lastUpdated?: boolean;
  profile?: {
    initials: string;
    name: string;
    meta?: string[];
  };
};

export function DashboardHeader({
  title,
  subtitle,
  actions,
  profile,
  compactPadding = false,
  lastUpdated = false,
}: DashboardHeaderProps) {
  const paddingClass = compactPadding
    ? "pb-6"
    : "px-6 py-6 sm:px-8 sm:py-8";
  return (
    <div
      className={`flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${paddingClass}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {profile && (
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
          >
            {profile.initials}
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{profile?.name ?? title}</h1>
          {profile?.meta && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--tott-muted)]">
              {profile.meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
          {!profile && subtitle && <p className="mt-1 text-sm text-[var(--tott-muted)]">{subtitle}</p>}
        </div>
      </div>
      {(actions || lastUpdated) && (
        <div className="flex shrink-0 flex-wrap items-center gap-4 lg:justify-end">
          {actions}
          {lastUpdated && <LastUpdatedIndicator />}
        </div>
      )}
    </div>
  );
}
