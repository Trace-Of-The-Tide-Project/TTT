"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type EditorApplication = {
  id: string;
  initials: string;
  name: string;
  badge: string;
  experience: string;
  timeAgo: string;
};

type EditorApplicationsProps = {
  items: EditorApplication[];
  viewAllHref?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

const AVATAR_PALETTE = [
  { bg: "var(--tott-sand-mid)", fg: "var(--tott-sea-deep)" },
  { bg: "var(--tott-sea-soft)", fg: "var(--tott-sea-deep)" },
  { bg: "var(--tott-seafoam-soft)", fg: "#1f5145" },
  { bg: "var(--tott-amber-soft)", fg: "#7a4f1c" },
];

function avatarTone(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]!;
}

export function EditorApplications({ items, viewAllHref, onApprove, onReject }: EditorApplicationsProps) {
  const t = useTranslations("Dashboard.adminHome.editorApplications");
  return (
    <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5 shadow-[0_1px_2px_rgba(22,36,58,0.04),0_4px_16px_rgba(22,36,58,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-[var(--tott-dash-control-hover)]"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-x-4 text-xs">
        <div className="border-b border-[var(--tott-dash-divider)] pb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
          {t("applicantHeader")}
        </div>
        <div className="border-b border-[var(--tott-dash-divider)] pb-2 text-end text-[11px] font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
          {t("statusHeader")}
        </div>

        {items.map((app) => {
          const tone = avatarTone(app.id || app.name);
          return (
            <div
              key={app.id}
              className="col-span-2 grid grid-cols-[1fr_auto] items-center gap-x-4 border-b border-[var(--tott-dash-divider)] py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ backgroundColor: tone.bg, color: tone.fg }}
                >
                  {app.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{app.name}</p>
                  <p className="truncate text-xs text-[var(--tott-muted)]">{app.experience}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ backgroundColor: "var(--tott-coral-tint-bg)", color: "var(--tott-coral)" }}
                >
                  {app.badge}
                </span>
                <button
                  type="button"
                  onClick={() => onApprove?.(app.id)}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold text-white transition-all hover:brightness-105"
                  style={{ backgroundColor: "var(--tott-seafoam)" }}
                >
                  {t("review")}
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(app.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
                  aria-label={t("more")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
