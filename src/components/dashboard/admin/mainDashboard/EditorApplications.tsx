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
  { bg: "var(--tott-sea-mid)", fg: "#ffffff" },
  { bg: "var(--tott-seafoam)", fg: "#ffffff" },
  { bg: "var(--tott-coral)", fg: "#ffffff" },
  { bg: "var(--tott-amber-warm)", fg: "#ffffff" },
];

function avatarTone(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length]!;
}

function ClockSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
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

      <div className="flex flex-col gap-2.5">
        {items.map((app) => {
          const tone = avatarTone(app.id || app.name);
          return (
            <div
              key={app.id}
              className="rounded-xl border border-[color:var(--tott-sea-soft)] bg-[var(--tott-sea-tint-bg)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ backgroundColor: tone.bg, color: tone.fg }}
                >
                  {app.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">{app.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: "var(--tott-coral)", color: "#ffffff" }}
                    >
                      {app.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]">{app.experience}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--tott-muted)] opacity-75">
                    <ClockSmallIcon /> {app.timeAgo}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onReject?.(app.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-[var(--tott-muted)] transition-colors hover:bg-white hover:text-[var(--tott-dash-negative)]"
                    aria-label={t("reject")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprove?.(app.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition-all hover:brightness-105"
                    style={{ backgroundColor: "var(--tott-seafoam)" }}
                    aria-label={t("approve")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
