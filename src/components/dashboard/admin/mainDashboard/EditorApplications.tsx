"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

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
};

function ClockSmallIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function EditorApplications({ items, viewAllHref }: EditorApplicationsProps) {
  const t = useTranslations("Dashboard.adminHome.editorApplications");
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="mb-4 flex items-center justify-between ">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-gray-500 hover:text-foreground"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4 mx-6">
        {items.map((app) => (
          <div
            key={app.id}
            className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-7 py-5 "
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                style={{
                  backgroundColor: "#DBC99E",
                  color: theme.bgDark,
                }}
              >
                {app.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{app.name}</span>
                  <span className="rounded bg-[#222] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-400">
                    {app.badge}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{app.experience}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <ClockSmallIcon /> {app.timeAgo}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 pl-[52px]">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-foreground transition-colors hover:border-gray-500"
                aria-label={t("viewApplication")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-foreground transition-colors hover:border-red-800 hover:text-red-400"
                aria-label={t("reject")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-foreground transition-colors hover:border-emerald-800 hover:text-emerald-400"
                aria-label={t("approve")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
